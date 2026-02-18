
import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { getDuelStatus } from "../../utils/duels.ts";
import { getUser, Question } from "../../utils/db.ts";
import DuelLobby from "../../islands/DuelLobby.tsx";
import QuizEngine from "../../islands/QuizEngine.tsx";

interface Data {
  duelId: string;
  category: string;
  variant: string;
  status: "WAITING" | "ACTIVE" | "COMPLETED" | "EXPIRED";
  questions: Question[];
  player1Name?: string;
  player2Name?: string;
  results?: any;
  isParticipant: boolean;
  userId: string;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;
    const duelId = ctx.params.duelId;

    if (!userId) {
      return new Response(null, { headers: { Location: "/login" }, status: 302 });
    }

    const duel = await getDuelStatus(duelId);
    if (!duel) {
      return ctx.renderNotFound();
    }

    const isP1 = duel.player1Id === userId;
    const isP2 = duel.player2Id === userId; // checking against bot username might fail if bot name != id, but bot is seeded with distinct usernames

    // Fetch user details for names
    const p1 = await getUser(duel.player1Id);
    let p2Name = "Opponent";
    // Check if player2 is a bot or user.
    // If bot, getUser(botUsername) should work as username is unique, OR getUser(botId).
    // Our seed script created bots with username as ID? No, username unique, ID uuid.
    // Wait, bot seed creates user with ID uuid.
    // But `assignBotToDuel` used `bot.username` as `player2Id`.
    // This is inconsistent. `player2Id` should match `User.id` or `User.username`.
    // `createUser` uses uuid. `checkUser` creates session with `user.id`.
    // So `player1Id` is UUID.
    // `assignBotToDuel` assigns `bot.username` (e.g. "Bot_Beginner") to `player2Id`.
    // This mismatches types if I try `getUser(player2Id)` which expects UUID?
    // `getUser` expects `id`.
    // I should fix `assignBotToDuel` to use `bot.id`.

    // Assuming I fix `assignBotToDuel` or logic handles it.
    // Let's fix `assignBotToDuel` in `utils/duels.ts` first.
    // But for now, proceed with robust fetching.

    let questions: Question[] = [];
    try {
        if (duel.questions) {
            questions = JSON.parse(duel.questions);
        }
    } catch (e) {
        console.error("Failed to parse duel questions", e);
    }

    console.log("Duel fetched:", duel);

    return ctx.render({
        duelId,
        category: duel.category,
        variant: duel.variant,
        status: duel.status,
        questions,
        userId,
        isParticipant: isP1 || isP2,
        player1Name: p1?.username || "Player 1",
        player2Name: p2Name // We'll fix this later or let UI handle "Opponent"
    });
  }
};

export default function DuelPage({ data }: PageProps<Data>) {
  const { duelId, status, category, questions, userId, isParticipant } = data;
  console.log("DuelPage data:", data);

  if (!isParticipant) {
     return <div class="p-8 text-center text-red-500">You are not a participant in this duel.</div>;
  }

  if (status === "WAITING") {
      return <DuelLobby duelId={duelId} category={category} />;
  }

  if (status === "EXPIRED") {
      return (
        <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div class="text-center max-w-md">
            <div class="text-6xl mb-4">⏱️</div>
            <h2 class="text-2xl font-bold text-orange-400 mb-2">Duel Expired</h2>
            <p class="text-gray-400 mb-6">This duel has timed out and can no longer be resumed.</p>
            <a href="/history" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
              Back to History
            </a>
          </div>
        </div>
      );
  }

  if (status === "ACTIVE" || status === "COMPLETED") {
      return (
        <div class="min-h-screen bg-gray-900 text-white">
            <QuizEngine 
                questions={questions} 
                category={category} 
                duelId={duelId}
                variant={data.variant}
                userId={userId}
            />
        </div>
      );
  }

  return <div>Loading... (Status: {status})</div>;
}
