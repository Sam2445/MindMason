
import { Handlers } from "$fresh/server.ts";
import { saveExamResult } from "../../utils/db.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    try {
      const data = await req.json();
      
      await saveExamResult({
        id: data.id,
        userId: data.userId,
        category: data.category,
        score: parseInt(data.score),
        totalQuestions: parseInt(data.totalQuestions),
        correctAnswers: parseInt(data.correctAnswers),
        timeTaken: parseInt(data.timeTaken),
        timestamp: data.timestamp,
        // @ts-ignore: Added recently
        duelId: data.duelId, 
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Failed to save score:", e);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  },
};
