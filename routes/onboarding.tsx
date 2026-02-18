import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { getUser, updateUserPreferences } from "../utils/db.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;

    if (!userId) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/login" },
      });
    }

    // Skip check for admin hardcoded session (which has "admin_token_secure" or "admin")
    if (userId === "admin_token_secure" || userId === "admin") {
      return ctx.render({ userId: "admin", isBoarded: true });
    }

    const user = await getUser(userId);
    if (!user) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/login" },
      });
    }

    if (user.onboardingCompleted) {
      return new Response(null, { status: 303, headers: { Location: "/" } });
    }

    return ctx.render({ user });
  },

  async POST(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;

    if (!userId) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/login" },
      });
    }

    const form = await req.formData();
    const targetExam = form.get("targetExam")?.toString();

    if (!targetExam) {
      return ctx.render({ error: "Please select an exam category" });
    }

    await updateUserPreferences(userId, targetExam);

    return new Response(null, {
      status: 303,
      headers: { Location: "/" },
    });
  },
};

const EXAM_OPTIONS = [
  {
    id: "UPSC",
    label: "UPSC",
    desc: "Civil Services, IFS, etc.",
    color: "blue",
  },
  { id: "SSC", label: "SSC", desc: "CGL, CHSL, MTS, etc.", color: "emerald" },
  {
    id: "BANKING",
    label: "Banking",
    desc: "IBPS, SBI, RBI, etc.",
    color: "purple",
  },
  {
    id: "STATE_EXAMS",
    label: "State Exams",
    desc: "State PSC, Police, etc.",
    color: "orange",
  },
  {
    id: "RAILWAYS",
    label: "Railways",
    desc: "RRB NTPC, Group D",
    color: "red",
  },
  { id: "DEFENCE", label: "Defence", desc: "NDA, CDS, AFCAT", color: "indigo" },
  { id: "TEACHING", label: "Teaching", desc: "CTET, State TET", color: "pink" },
  { id: "OTHER", label: "Other", desc: "General Competitions", color: "gray" },
];

export default function OnboardingPage(props: PageProps) {
  const { error } = props.data || {};
  return (
    <div class="min-h-screen bg-gray-900 px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <header class="text-center mb-12">
          <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
            Welcome to MindMason
          </h1>
          <p class="text-xl text-gray-300">
            Let's personalize your learning experience. What are you preparing
            for?
          </p>
        </header>

        {error && (
          <div class="max-w-md mx-auto bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-8 text-center">
            {error}
          </div>
        )}

        <form method="POST">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {EXAM_OPTIONS.map((exam) => (
              <label class="cursor-pointer group relative">
                <input
                  type="radio"
                  name="targetExam"
                  value={exam.id}
                  class="peer sr-only"
                  required
                />
                <div
                  class={`
                            p-6 rounded-xl border-2 border-gray-700 bg-gray-800 
                            hover:border-${exam.color}-500 transition-all duration-300
                            peer-checked:border-${exam.color}-500 peer-checked:bg-gray-700 peer-checked:shadow-[0_0_20px_rgba(0,0,0,0.3)]
                            h-full flex flex-col items-center text-center
                        `}
                >
                  <div
                    class={`
                                w-12 h-12 rounded-full mb-4 flex items-center justify-center
                                bg-${exam.color}-500/20 text-${exam.color}-400
                                group-hover:scale-110 transition-transform
                            `}
                  >
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-white mb-2">
                    {exam.label}
                  </h3>
                  <p class="text-sm text-gray-400">{exam.desc}</p>
                </div>
                <div
                  class={`absolute top-4 right-4 text-${exam.color}-500 opacity-0 peer-checked:opacity-100 transition-opacity`}
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </label>
            ))}
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Preparation 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
