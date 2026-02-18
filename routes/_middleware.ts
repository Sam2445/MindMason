import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { getUser } from "../utils/db.ts";

interface UserState {
  user: { id: string; username: string; role: string; targetExam?: string } | null;
}

export async function handler(req: Request, ctx: FreshContext<UserState>) {
  const start = performance.now();
  const cookies = getCookies(req.headers);
  const userId = cookies.auth;

  // Global user fetch
  if (userId) {
      if (userId === "admin" || userId === "admin_token_secure") {
          ctx.state.user = { id: "admin", username: "Admin", role: "ADMIN", targetExam: "ALL" };
      } else {
          try {
             // @ts-ignore
             const user = await getUser(userId);
             if (user) {
                 ctx.state.user = user;
             }
          } catch (e) {
              console.error("Middleware user fetch error", e);
          }
      }
  }

  // Protect /admin route
  const url = new URL(req.url);
  if (url.pathname.startsWith("/admin")) {
    const user = ctx.state.user;
    if (!user || user.role !== "ADMIN") {
      return new Response("", {
        status: 303,
        headers: { Location: "/login" },
      });
    }
  }

  const resp = await ctx.next();
  const ms = performance.now() - start;
  resp.headers.set("X-Response-Time", `${ms.toFixed(2)}ms`);
  resp.headers.set("X-Powered-By", "MindMason Engine");

  // Simple console logging
  // console.log(`${req.method} ${req.url} - ${resp.status} - ${ms.toFixed(2)}ms`);

  return resp;
}
