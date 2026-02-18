// ... imports
import { getRandomQuestions } from "./db.ts";
import { prisma } from "./db.ts";

// Maximum time (in minutes) a duel can remain active before auto-expiring
const DUEL_EXPIRY_MINUTES: Record<string, number> = {
  STANDARD: 10,
  RAPID: 5,
  BLITZ: 3,
};
const DEFAULT_EXPIRY_MINUTES = 10;

// Per-question ELO adjustments
const ELO_CORRECT_GAIN = 5;   // ELO gained per correct answer
const ELO_WRONG_LOSS = 3;     // ELO lost per wrong answer
const ELO_FLOOR = 100;        // Minimum ELO rating

// Extra penalties applied at duel end
const PENALTY_PER_WRONG = 2;
const PENALTY_PER_SKIP = 0.5;

export interface DuelState {
  id: string;
  player1Id: string;
  player2Id: string | null;
  status: "WAITING" | "ACTIVE" | "COMPLETED" | "EXPIRED";
  category: string;
  variant: string;
  questions?: string;
}

export async function joinDuelQueue(userId: string, category: string, variant: string = "STANDARD", subject: string = "all"): Promise<DuelState> {
  // 1. Look for an open duel in this category, subject, AND variant (that is not created by self)
  // @ts-ignore: Prisma dynamic model access
  const openDuel = await prisma.duel.findFirst({
    where: {
      category,
      subject,
      variant, 
      status: "WAITING",
      player1Id: { not: userId }, // Don't join own duel
    },
    orderBy: { createdAt: "asc" },
  });

  if (openDuel) {
    // Join it
    // @ts-ignore: Prisma dynamic model access
    return await prisma.duel.update({
      where: { id: openDuel.id },
      data: {
        player2Id: userId,
        status: "ACTIVE",
      },
    });
  } else {
    // Fetch random questions for this duel (filtered by subject)
    const questions = await getRandomQuestions(category, 5, subject !== "all" ? subject : undefined);
    
    // Create new waiting duel
    // @ts-ignore: Prisma dynamic model access
    return await prisma.duel.create({
      data: {
        player1Id: userId,
        category,
        subject,
        variant,
        status: "WAITING",
        questions: JSON.stringify(questions),
      },
    });
  }
}

export async function getDuelStatus(duelId: string): Promise<DuelState | null> {
    // @ts-ignore
    return await prisma.duel.findUnique({
        where: { id: duelId }
    });
}

export async function assignBotToDuel(duelId: string, category: string) {
    // 1. Get the duel to find player1
    // @ts-ignore
    const duel = await prisma.duel.findUnique({
        where: { id: duelId },
    });

    if (!duel || !duel.player1Id) throw new Error("Invalid duel");

    // 2. Get player1's rating
    // @ts-ignore
    const player1 = await prisma.user.findUnique({
        where: { id: duel.player1Id },
    });

    const targetRating = player1?.skillRating || 1000;

    // 3. Find a bot with closest rating
    // @ts-ignore
    const bots = await prisma.user.findMany({
        where: { isBot: true },
    });

    if (!bots.length) throw new Error("No bots available");

    // Simple closest number logic
    const bot = bots.reduce((prev: any, curr: any) => {
        return (Math.abs(curr.skillRating - targetRating) < Math.abs(prev.skillRating - targetRating) ? curr : prev);
    });

    // @ts-ignore
    return await prisma.duel.update({
        where: { id: duelId },
        data: {
            player2Id: bot.id, 
            status: "ACTIVE",
        }
    });
}

function calculateElo(ratingA: number, ratingB: number, actualScoreA: number, kFactor: number = 32) {
    const expectedScoreA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    return Math.round(ratingA + kFactor * (actualScoreA - expectedScoreA));
}

/**
 * Update a user's ELO based on a single question answer.
 * Correct = +ELO_CORRECT_GAIN, Wrong = -ELO_WRONG_LOSS (with floor).
 */
export async function updateQuestionElo(userId: string, isCorrect: boolean) {
    // @ts-ignore: Prisma dynamic model access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const delta = isCorrect ? ELO_CORRECT_GAIN : -ELO_WRONG_LOSS;
    const newRating = Math.max(ELO_FLOOR, user.skillRating + delta);

    // @ts-ignore: Prisma dynamic model access
    await prisma.user.update({
        where: { id: userId },
        data: { skillRating: newRating }
    });

    return newRating;
}

export async function completeDuel(duelId: string, winnerId: string | null) {
    // 1. Get duel and players
    // @ts-ignore: Prisma dynamic model access
    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel || duel.status === "COMPLETED" || duel.status === "EXPIRED") return; // Already processed

    const p1Id = duel.player1Id;
    const p2Id = duel.player2Id;

    if (!p2Id) return; // Should not happen in active duel

    // @ts-ignore: Prisma dynamic model access
    const p1 = await prisma.user.findUnique({ where: { id: p1Id } });
    // @ts-ignore: Prisma dynamic model access
    const p2 = await prisma.user.findUnique({ where: { id: p2Id } });

    if (!p1 || !p2) return;

    // 2. Calculate new ELO
    // Score: 1 for win, 0 for loss, 0.5 for draw
    let s1, s2;
    if (winnerId === "DRAW") {
        s1 = 0.5;
        s2 = 0.5;
    } else if (winnerId === p1Id) {
        s1 = 1;
        s2 = 0;
    } else {
        s1 = 0;
        s2 = 1;
    }

    const newR1 = calculateElo(p1.skillRating, p2.skillRating, s1);
    const newR2 = calculateElo(p2.skillRating, p1.skillRating, s2);

    // 3. Update Users
    // @ts-ignore: Prisma dynamic model access
    await prisma.user.update({
        where: { id: p1Id },
        data: { skillRating: newR1 }
    });

    // @ts-ignore: Prisma dynamic model access
    await prisma.user.update({
        where: { id: p2Id },
        data: { skillRating: newR2 }
    });

    // 4. Update Duel
    // @ts-ignore: Prisma dynamic model access
    await prisma.duel.update({
        where: { id: duelId },
        data: {
            status: "COMPLETED",
            winnerId: winnerId === "DRAW" ? null : winnerId
        }
    });

    return { newR1, newR2 };
}

/**
 * Complete a duel based on current progress (for exit/expiry scenarios).
 * Determines winner from partial results and updates ELO accordingly.
 */
export async function completeDuelWithProgress(duelId: string, finalStatus: "COMPLETED" | "EXPIRED" = "COMPLETED") {
    // @ts-ignore: Prisma dynamic model access
    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel || duel.status === "COMPLETED" || duel.status === "EXPIRED") return;

    const p1Progress = duel.player1Progress ? JSON.parse(duel.player1Progress) : { score: 0, answers: {} };
    const p2Progress = duel.player2Progress ? JSON.parse(duel.player2Progress) : { score: 0, answers: {} };

    const p1Score = p1Progress.score || 0;
    const p2Score = p2Progress.score || 0;

    let winnerId: string | null = null;
    if (p1Score > p2Score) {
        winnerId = duel.player1Id;
    } else if (p2Score > p1Score) {
        winnerId = duel.player2Id;
    }
    // null = draw

    // Update the duel status
    // @ts-ignore: Prisma dynamic model access
    await prisma.duel.update({
        where: { id: duelId },
        data: {
            status: finalStatus,
            winnerId: winnerId,
        },
    });

    // Also update win/loss ELO if both players exist
    if (duel.player2Id) {
        // @ts-ignore: Prisma dynamic model access
        const p1 = await prisma.user.findUnique({ where: { id: duel.player1Id } });
        // @ts-ignore: Prisma dynamic model access
        const p2 = await prisma.user.findUnique({ where: { id: duel.player2Id } });

        if (p1 && p2) {
            let s1, s2;
            if (!winnerId) {
                s1 = 0.5; s2 = 0.5;
            } else if (winnerId === duel.player1Id) {
                s1 = 1; s2 = 0;
            } else {
                s1 = 0; s2 = 1;
            }

            let newR1 = calculateElo(p1.skillRating, p2.skillRating, s1);
            let newR2 = calculateElo(p2.skillRating, p1.skillRating, s2);

            // Apply specific penalties for Wrong vs Skip (user request)
            const questions = duel.questions ? JSON.parse(duel.questions) : [];
            
            const calcPenalty = (answers: Record<string, number>) => {
                let p = 0;
                questions.forEach((q: any, idx: number) => {
                    const ans = answers[idx];
                    if (ans === undefined || ans === -1) {
                         p += PENALTY_PER_SKIP; 
                    } else if (ans !== q.correctIndex) {
                         p += PENALTY_PER_WRONG;
                    }
                });
                return Math.round(p);
            };

            const pen1 = calcPenalty(p1Progress.answers || {});
            const pen2 = calcPenalty(p2Progress.answers || {});

            newR1 = Math.max(ELO_FLOOR, newR1 - pen1);
            newR2 = Math.max(ELO_FLOOR, newR2 - pen2);

            // @ts-ignore: Prisma dynamic model access
            await prisma.user.update({ where: { id: duel.player1Id }, data: { skillRating: newR1 } });
            // @ts-ignore: Prisma dynamic model access
            await prisma.user.update({ where: { id: duel.player2Id }, data: { skillRating: newR2 } });
        }
    }

    return { p1Score, p2Score, winnerId };
}

/**
 * Auto-expire duels that have exceeded their time limit.
 * Marks them as EXPIRED so they no longer show a "Resume" option.
 */
async function expireOldDuels(userId: string) {
    // @ts-ignore: Prisma dynamic model access
    const staleDuels = await prisma.duel.findMany({
        where: {
            OR: [
                { player1Id: userId },
                { player2Id: userId }
            ],
            status: { in: ["WAITING", "ACTIVE"] },
        },
    });

    const now = new Date();

    for (const duel of staleDuels) {
        const expiryMinutes = DUEL_EXPIRY_MINUTES[duel.variant] || DEFAULT_EXPIRY_MINUTES;
        const createdAt = new Date(duel.createdAt);
        const elapsedMs = now.getTime() - createdAt.getTime();
        const elapsedMinutes = elapsedMs / (1000 * 60);

        if (elapsedMinutes > expiryMinutes) {
            // Complete the duel with current progress and update ELO
            try {
                await completeDuelWithProgress(duel.id, "EXPIRED");
            } catch (err) {
                console.error(`Failed to complete expired duel ${duel.id}:`, err);
                // Fallback: just mark as expired
                // @ts-ignore: Prisma dynamic model access
                await prisma.duel.update({
                    where: { id: duel.id },
                    data: { status: "EXPIRED" },
                });
            }
        }
    }
}

export async function getUserDuels(userId: string) {
    // Auto-expire old duels before fetching
    await expireOldDuels(userId);

    // @ts-ignore
    return await prisma.duel.findMany({
        where: {
            OR: [
                { player1Id: userId },
                { player2Id: userId }
            ]
        },
        orderBy: { createdAt: "desc" }
    });
}
