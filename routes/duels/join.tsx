import { Handlers } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { joinDuelQueue } from "../../utils/duels.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;
    
    // Redirect if not logged in
    if (!userId || userId === "admin") {
      return new Response(null, { headers: { Location: "/login" }, status: 302 });
    }

    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "upsc";
    const mode = url.searchParams.get("mode");
    const variant = url.searchParams.get("variant") || "STANDARD";
    const subject = url.searchParams.get("subject") || "all";

    if (mode === "queue") {
       try {
           const duel = await joinDuelQueue(userId, category, variant, subject);
           return new Response(null, { headers: { Location: `/duels/${duel.id}` }, status: 302 });
       } catch (e) {
           console.error("Failed to join duel queue", e);
           return new Response("Error joining queue", { status: 500 });
       }
    }

    return ctx.render({ userId, category });
  }
};
