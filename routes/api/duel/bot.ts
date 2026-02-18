
import { Handlers } from "$fresh/server.ts";
import { assignBotToDuel, getDuelStatus } from "../../../utils/duels.ts";

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const duelId = url.searchParams.get("id");
    
    if (!duelId) return new Response("Missing ID", { status: 400 });

    try {
        await assignBotToDuel(duelId, "generic"); // Category doesn't matter much for bot assign logic
        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        console.error(e);
        return new Response("Error", { status: 500 });
    }
  }
};
