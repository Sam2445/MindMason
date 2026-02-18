
import { Handlers } from "$fresh/server.ts";
import { prisma } from "../../../utils/db.ts";
import { completeDuelWithProgress } from "../../../utils/duels.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { duelId, userId } = body;

      if (!duelId || !userId) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
      }

      // @ts-ignore: Prisma dynamic model access
      const duel = await prisma.duel.findUnique({ where: { id: duelId } });
      if (!duel) {
        return new Response(JSON.stringify({ error: "Duel not found" }), { status: 404 });
      }

      if (duel.status === "COMPLETED" || duel.status === "EXPIRED") {
        return new Response(JSON.stringify({ error: "Duel already finished" }), { status: 400 });
      }

      // Verify user is a participant
      const isP1 = duel.player1Id === userId;
      const isP2 = duel.player2Id === userId;
      if (!isP1 && !isP2) {
        return new Response(JSON.stringify({ error: "Not a participant" }), { status: 403 });
      }

      // Complete the duel with current progress
      const result = await completeDuelWithProgress(duelId, "COMPLETED");

      // Get updated duel to read progress
      // @ts-ignore: Prisma dynamic model access
      const updatedDuel = await prisma.duel.findUnique({ where: { id: duelId } });
      const myProgress = isP1
        ? JSON.parse(updatedDuel?.player1Progress || "{}")
        : JSON.parse(updatedDuel?.player2Progress || "{}");

      const answeredCount = Object.keys(myProgress.answers || {}).length;
      const myScore = myProgress.score || 0;

      // Save ExamResult for the user
      try {
        // @ts-ignore: Prisma dynamic model access
        await prisma.examResult.create({
          data: {
            userId,
            category: duel.category,
            score: myScore,
            totalQuestions: answeredCount,
            correctAnswers: myScore,
            timeTaken: 0,
            duelId: duelId,
          },
        });
      } catch (e) {
        console.error("Failed to save exam result on exit:", e);
      }

      return new Response(JSON.stringify({
        success: true,
        winnerId: result?.winnerId || null,
        p1Score: result?.p1Score || 0,
        p2Score: result?.p2Score || 0,
        myScore,
        answeredCount,
      }), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (e) {
      console.error("Exit duel error:", e);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  }
};
