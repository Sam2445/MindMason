
import { Handlers } from "$fresh/server.ts";
import { joinDuelQueue } from "../../../utils/duels.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    try {
      const { userId, category } = await req.json();
      
      if (!userId || !category) {
        return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });
      }

      const duel = await joinDuelQueue(userId, category);
      
      return new Response(JSON.stringify({ duelId: duel.id }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  },
};
