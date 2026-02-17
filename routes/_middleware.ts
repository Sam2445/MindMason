import { FreshContext } from "$fresh/server.ts";

export async function handler(req: Request, ctx: FreshContext) {
  const start = performance.now();
  const resp = await ctx.next();
  const ms = performance.now() - start;
  resp.headers.set("X-Response-Time", `${ms.toFixed(2)}ms`);
  resp.headers.set("X-Powered-By", "MindMason Engine");
  
  // Simple console logging
  console.log(`${req.method} ${req.url} - ${resp.status} - ${ms.toFixed(2)}ms`);
  
  return resp;
}
