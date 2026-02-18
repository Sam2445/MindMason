import { Handlers, PageProps } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";

import { checkUser } from "../utils/db.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const form = await req.formData();
    const username = form.get("username")?.toString();
    const password = form.get("password")?.toString();

    let user = null;

    // Check Hardcoded Admin
    if (username === "admin" && password === "mindmason123") {
      user = { id: "admin", role: "ADMIN", onboardingCompleted: true };
    } else if (username && password) {
      // Check Database
      user = await checkUser(username, password);
    }

    if (user) {
      const headers = new Headers();
      setCookie(headers, {
        name: "auth",
        value: user.id,
        maxAge: 3600 * 24 * 7, // 1 week
        path: "/",
        sameSite: "Lax", // Recommended for basic auth
        domain: new URL(req.url).hostname,
      });

      const destination = (!user.onboardingCompleted && user.role !== "ADMIN")
        ? "/onboarding"
        : "/";
      headers.set("Location", destination);

      return new Response(null, {
        status: 303,
        headers,
      });
    }

    return ctx.render({ error: "Invalid credentials" });
  },
};

export default function LoginPage(props: PageProps) {
  const { error } = props.data || {};
  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          MindMason Login
        </h1>

        {error && (
          <div class="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form method="POST" class="space-y-4">
          <div>
            <label class="block text-gray-400 text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-gray-400 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
          >
            Login
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-400">
            Don't have an account?{" "}
            <a href="/signup" class="text-emerald-400 hover:text-emerald-300">
              Sign Up
            </a>
          </p>
          <a
            href="/"
            class="text-sm text-gray-500 hover:text-gray-300 block mt-2"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
