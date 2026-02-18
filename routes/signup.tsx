import { Handlers, PageProps } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";
import * as bcrypt from "npm:bcryptjs";
import { createUser } from "../utils/db.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const form = await req.formData();
    const username = form.get("username")?.toString();
    const password = form.get("password")?.toString();
    const confirmPassword = form.get("confirmPassword")?.toString();

    if (!username || !password || !confirmPassword) {
      return ctx.render({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return ctx.render({ error: "Passwords do not match" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(username, hashedPassword);

      const headers = new Headers();
      setCookie(headers, {
        name: "auth",
        value: user.id, // Storing User ID in cookie
        maxAge: 3600 * 24 * 7, // 1 week
        path: "/",
        sameSite: "Lax",
        domain: new URL(req.url).hostname,
      });

      headers.set("Location", "/onboarding");
      return new Response(null, {
        status: 303,
        headers,
      });
    } catch (e) {
      // Assume unique constraint violation usually
      return ctx.render({
        error: "Username already taken or error creating account",
      });
    }
  },
};

export default function SignupPage(props: PageProps) {
  const { error } = props.data || {};
  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div class="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Join MindMason
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

          <div>
            <label class="block text-gray-400 text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-colors"
          >
            Create Account
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-400">
            Already have an account?{" "}
            <a href="/login" class="text-blue-400 hover:text-blue-300">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
