import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

export async function handler(req: Request, ctx: FreshContext) {
  // Protect /admin route
  const url = new URL(req.url);
  if (url.pathname.startsWith("/admin")) {
    const cookies = getCookies(req.headers);
    // Simple token check
    if (cookies.auth !== "admin_token_secure") {
      return new Response("", {
        status: 303,
        headers: { Location: "/login" },
      });
    }
  }
  const start = performance.now();
  const resp = await ctx.next();
  const ms = performance.now() - start;
  resp.headers.set("X-Response-Time", `${ms.toFixed(2)}ms`);
  resp.headers.set("X-Powered-By", "MindMason Engine");
  
  // Simple console logging
  console.log(`${req.method} ${req.url} - ${resp.status} - ${ms.toFixed(2)}ms`);
  
  return resp;
}
