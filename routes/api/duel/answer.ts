
import { Handlers } from "$fresh/server.ts";
import { prisma } from "../../../utils/db.ts";
import { updateQuestionElo } from "../../../utils/duels.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { duelId, userId, questionIndex, answerIndex, score, isCorrect } = body;

      if (!duelId || !userId || questionIndex === undefined || answerIndex === undefined) {
        return new Response("Missing fields", { status: 400 });
      }

      // @ts-ignore: Prisma dynamic model access
      const duel = await prisma.duel.findUnique({
        where: { id: duelId },
      });

      if (!duel) return new Response("Duel not found", { status: 404 });

      const isPlayer1 = duel.player1Id === userId;
      const isPlayer2 = duel.player2Id === userId;

      if (!isPlayer1 && !isPlayer2) return new Response("User not in duel", { status: 403 });

      // Parse current progress
      let progress = isPlayer1 
          ? (duel.player1Progress ? JSON.parse(duel.player1Progress) : { currentQuestionIndex: 0, answers: {}, score: 0 }) 
          : (duel.player2Progress ? JSON.parse(duel.player2Progress) : { currentQuestionIndex: 0, answers: {}, score: 0 });

      // Check if already answered (prevent duplicate ELO updates)
      const alreadyAnswered = progress.answers && progress.answers[questionIndex] !== undefined;

      // Update progress
      progress.currentQuestionIndex = Math.max(progress.currentQuestionIndex, questionIndex + 1);
      progress.answers[questionIndex] = { answerIndex, isCorrect };
      progress.score = score;

      const updateData = isPlayer1 
          ? { player1Progress: JSON.stringify(progress) } 
          : { player2Progress: JSON.stringify(progress) };

      // @ts-ignore: Prisma dynamic model access
      await prisma.duel.update({
        where: { id: duelId },
        data: updateData,
      });

      // Update per-question ELO (only if not already answered and not a timeout)
      if (!alreadyAnswered && answerIndex !== -1) {
        try {
          const newRating = await updateQuestionElo(userId, isCorrect);
          return new Response(JSON.stringify({ success: true, newRating }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("Failed to update question ELO:", e);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
      });

    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  }
};
