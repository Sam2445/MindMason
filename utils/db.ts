// @ts-ignore: Prisma generated client import
import pkg from "../generated/client/index.js";
import * as bcrypt from "npm:bcryptjs";

const { PrismaClient } = pkg;

// Initialize Prisma Client
// deno-lint-ignore no-explicit-any
export const prisma = new PrismaClient() as any;

export interface Question {
  id: string;
  category: string;
  subject?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: string;
}

export interface ExamResult {
  id: string;
  userId: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  userId: string;
  totalScore: number;
  testsTaken: number;
  averageScore: number;
}

// @ts-ignore
export async function createUser(username: string, passwordHash: string) {
  try {
    // @ts-ignore
    return await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });
  } catch (e) {
    console.error("Error creating user:", e);
    throw e;
  }
}

export async function checkUser(username: string, password: string) {
  try {
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? user : null;
  } catch (e) {
    console.error("Auth error", e);
    return null;
  }
}

export async function updateUserPreferences(
  userId: string,
  targetExam: string,
) {
  try {
    // @ts-ignore
    return await prisma.user.update({
      where: { id: userId },
      data: {
        targetExam,
        onboardingCompleted: true,
      },
    });
  } catch (e) {
    console.error("Error updating preferences:", e);
    throw e;
  }
}

export async function getUser(userId: string) {
  try {
    // @ts-ignore
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch (e) {
    return null;
  }
}

export async function addQuestion(q: Question) {
  try {
    const created = await prisma.question.create({
      data: {
        id: q.id || crypto.randomUUID(),
        category: q.category,
        subject: q.subject || "general",
        text: q.text,
        options: JSON.stringify(q.options), // Store options as JSON string
        correctIndex: q.correctIndex,
        // @ts-ignore: Prisma dynamic model access
        explanation: q.explanation,
        // @ts-ignore: Prisma dynamic model access
        difficulty: q.difficulty,
      },
    });
    return { ...created, options: JSON.parse(created.options) };
  } catch (e) {
    console.error("Error adding question:", e);
    throw e;
  }
}

export async function getQuestions(category?: string, subject?: string): Promise<Question[]> {
  try {
    const where: Record<string, unknown> = {};
    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (subject && subject !== "all") {
      where.subject = { equals: subject, mode: "insensitive" };
    }
    // @ts-ignore: Prisma dynamic model access
    const rawQuestions = await prisma.question.findMany({ where });

    return rawQuestions.map((q: any) => {
      let options = [];
      try {
        options = typeof q.options === "string"
          ? JSON.parse(q.options)
          : q.options;
      } catch (e) {
        console.error(`Failed to parse options for question ${q.id}`, e);
        options = ["Error loading options"];
      }
      return {
        id: q.id,
        category: q.category,
        subject: q.subject || "general",
        text: q.text,
        options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
      };
    });
  } catch (e) {
    console.error("Error fetching questions:", e);
    return [];
  }
}

export async function getRandomQuestions(
  category: string,
  count: number,
  subject?: string,
): Promise<Question[]> {
  const all = await getQuestions(category, subject);
  // Fisher-Yates Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

export async function clearQuestions() {
  await prisma.question.deleteMany();
}

export async function saveExamResult(result: ExamResult) {
  try {
    await prisma.examResult.create({
      data: {
        id: result.id || crypto.randomUUID(),
        userId: result.userId,
        category: result.category,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeTaken: result.timeTaken,
        timestamp: new Date(result.timestamp), // Ensure Date object
      },
    });
  } catch (e) {
    console.error("Error saving result:", e);
    throw e;
  }
}

export async function getExamResults(): Promise<ExamResult[]> {
  try {
    const rawResults = await prisma.examResult.findMany({
      orderBy: { timestamp: "desc" },
    });

    return rawResults.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      category: r.category,
      score: r.score,
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers,
      timeTaken: r.timeTaken,
      timestamp: r.timestamp.toISOString(),
    }));
  } catch (e) {
    console.error("Error fetching results:", e);
    return [];
  }
}

export async function getLeaderboard() {
  // @ts-ignore
  const results = await prisma.examResult.findMany({
    orderBy: { score: 'desc' }
  });
  
  // Since we might not have a direct relation in schema yet or it's implicitly handled, 
  // let's do a safe manual filter.
  // Ideally: schema should have relation. 
  // Let's first get all unique userIds from results
  const userIds = [...new Set(results.map((r: any) => r.userId))];
  
  // Fetch users who are NOT bots
  // @ts-ignore
  const validUsers = await prisma.user.findMany({
      where: {
          id: { in: userIds },
          isBot: false
      }
  });

  const validUserIds = new Set(validUsers.map((u: any) => u.id));
  const userMap = new Map(validUsers.map((u: any) => [u.id, u]));

  const stats: Record<string, { total: number; count: number; username: string }> = {};

  for (const r of results) {
    if (!validUserIds.has(r.userId)) continue;
    
    // @ts-ignore
    const user = userMap.get(r.userId);
    const name = user?.username || r.userId;
    
    if (name === "admin" || name === "guest-user") continue; 

    if (!stats[r.userId]) {
        stats[r.userId] = { total: 0, count: 0, username: name };
    }
    stats[r.userId].total += r.score;
    stats[r.userId].count += 1;
  }

  return Object.values(stats)
    .map((data) => ({
      userId: data.username,
      totalScore: data.total,
      testsTaken: data.count,
      averageScore: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 50);
}

export async function seedQuestionsIfEmpty() {
  const count = await prisma.question.count();
  if (count === 0) {
    console.log("Seeding Database...");
    await addQuestion({
      id: "1",
      category: "upsc",
      text: "Sample Question?",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
    });
  }
}
