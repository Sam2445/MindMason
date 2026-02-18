import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { getUser, prisma } from "../utils/db.ts";
import DuelDashboardCard from "../islands/DuelDashboardCard.tsx";
import { EXAM_SUBJECTS } from "../utils/subjects.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;
    let user = null;
    // deno-lint-ignore no-explicit-any
    let subjectCounts: any[] = [];

    if (userId) {
      if (userId === "admin" || userId === "admin_token_secure") {
        user = { username: "Admin", role: "ADMIN", targetExam: "ALL" };
      } else {
        user = await getUser(userId);
      }
      
      if (user && user.targetExam && user.targetExam !== "ALL") {
          try {
             // @ts-ignore: Prisma groupBy
             const counts = await prisma.question.groupBy({
                 by: ['subject'],
                 where: {
                     category: user.targetExam,
                 },
                 _count: {
                     id: true
                 }
             });
             subjectCounts = counts;
          } catch (e) {
              console.error("Failed to fetch subject counts", e);
          }
      }
    }

    return ctx.render({ user, subjectCounts });
  },
};

export default function Home(props: PageProps) {
  const { user, subjectCounts } = props.data;

  return (
    <>
      <div class="px-4 py-8 mx-auto max-w-7xl">

        {user
          ? (
            <div class="max-w-screen-lg mx-auto">
              <div class="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
                <h2 class="text-2xl font-bold mb-4 text-white">
                  Your Dashboard
                </h2>
                <p class="text-gray-400 mb-6">
                  Targeting:{" "}
                  <span class="text-emerald-400 font-bold">
                    {user.targetExam || "Not Set"}
                  </span>
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 class="text-xl font-bold text-blue-400 mb-2">
                      Continue Practice
                    </h3>
                    <p class="text-gray-400 mb-4">
                      Resume your last session or start a new quiz.
                    </p>
                    <a
                      href={`/exams/${
                        user.targetExam?.toLowerCase() || "upsc"
                      }`}
                      class="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                    >
                      Start Quiz
                    </a>
                  </div>
                  <div class="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                    <h3 class="text-xl font-bold text-purple-400 mb-2">
                      Progress Analysis
                    </h3>
                    <p class="text-gray-400 mb-4">
                      Check your performance stats and weak areas.
                    </p>
                    <a
                      href="/leaderboard"
                      class="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                    >
                      View Stats
                    </a>
                  </div>

                  <DuelDashboardCard
                       userTarget={user.targetExam || "upsc"}
                       subjectCounts={subjectCounts || []}
                  />
                </div>
              </div>
              
              <h3 class="text-xl font-bold mb-4 text-gray-200">
                Browse Exams
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
                {Object.values(EXAM_SUBJECTS).map((exam) => (
                  <a
                    key={exam.examId}
                    href={`/exams/${exam.examId.toLowerCase()}`}
                    class="block p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all group"
                  >
                    <div class="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {getExamIcon(exam.examId)} 
                    </div>
                    <h3 class="font-bold text-gray-200 group-hover:text-blue-400">
                      {exam.examLabel}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">
                      {exam.subjects.length} Subjects
                    </p>
                  </a>
                ))}
              </div>

              <h3 class="text-xl font-bold mb-4 text-gray-200">
                Recommended for {user.targetExam || "You"}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {/* Dynamic Logic to show relevant exams based on target */}
                <ExamCard
                  title="General Knowledge"
                  desc="Daily CA & GK Updates"
                  color="orange"
                  href="/exams/gk"
                />
                <ExamCard
                  title="Mock Test Series"
                  desc="Full length mock tests"
                  color="emerald"
                  href="/exams/mock"
                />
                <ExamCard
                  title="Previous Year Qs"
                  desc="PYQs for last 5 years"
                  color="indigo"
                  href="/exams/pyq"
                />
              </div>
            </div>
          )
          : (
            <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center h-[70vh]">
              <h1 class="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 text-center">
                Crack Your Dream Exam
              </h1>
              <p class="text-xl text-gray-300 mb-10 text-center">
                Personalized preparation for UPSC, SSC, Banking, and more.
                <br />
                Start your journey today.
              </p>
              <div class="flex gap-4">
                <a
                  href="/signup"
                  class="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  Get Started Free
                </a>
                <a
                  href="/exams/demo"
                  class="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 font-bold text-lg hover:bg-gray-700 transition-all"
                >
                  Try Demo
                </a>
              </div>
            </div>
          )}
      </div>
    </>
  );
}

function ExamCard(
  { title, desc, color, href }: {
    title: string;
    desc: string;
    color: string;
    href: string;
  },
) {
  return (
    <a
      href={href}
      class={`group relative block p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 overflow-hidden border border-gray-700 hover:border-${color}-500`}
    >
      <div
        class={`absolute inset-0 bg-${color}-500 opacity-0 group-hover:opacity-5 transition-opacity`}
      >
      </div>
      <h2 class={`text-xl font-bold mb-2 group-hover:text-${color}-400`}>
        {title}
      </h2>
      <p class="text-gray-400 text-sm">{desc}</p>
    </a>
  );
}

function getExamIcon(id: string) {
  const icons: Record<string, string> = {
    BANKING: "🏦",
    UPSC: "🏛️",
    SSC: "🏢",
    RAILWAYS: "🚂",
    DEFENCE: "🛡️",
    TEACHING: "👨‍🏫",
    STATE_EXAMS: "🗺️",
    OTHER: "📚"
  };
  return icons[id] || "📝";
}
