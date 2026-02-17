import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    const body = await req.json();
    // Dummy Auth Logic
    if (body.username === "admin" && body.password === "password") {
         return new Response(JSON.stringify({ token: "fake-jwt-token" }), {
            headers: { "Content-Type": "application/json" }
         });
    }
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
    });
  }
};
