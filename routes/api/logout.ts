import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
  GET(req) {
    const headers = new Headers();
    deleteCookie(headers, "auth", {
      path: "/",
      domain: new URL(req.url).hostname,
    });

    headers.set("Location", "/");
    return new Response(null, {
      status: 302,
      headers,
    });
  },
};
