import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getLeaderboard, LeaderboardEntry } from "../utils/db.ts";

export const handler: Handlers<LeaderboardEntry[]> = {
  async GET(_req, ctx) {
    const data = await getLeaderboard();
    return ctx.render(data);
  },
};

export default function LeaderboardPage(
  { data }: PageProps<LeaderboardEntry[]>,
) {
  return (
    <>
      <Head>
        <title>Leaderboard - MindMason</title>
      </Head>
      <div class="min-h-screen bg-gray-900 text-white p-4 py-12">
        <div class="max-w-4xl mx-auto space-y-8">
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
              MindMason Champions
            </h1>
            <p class="text-gray-400">Top performers across all categories</p>
          </div>

          <div class="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-900/50 text-gray-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th class="px-6 py-4">Rank</th>
                    <th class="px-6 py-4">User</th>
                    <th class="px-6 py-4 text-center">Score</th>
                    <th class="px-6 py-4 text-center">Tests Taken</th>
                    <th class="px-6 py-4 text-center">Avg. Score</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                  {data.map((entry, idx) => (
                    <tr
                      key={entry.userId}
                      class="hover:bg-gray-700/30 transition-colors group"
                    >
                      <td class="px-6 py-4 font-bold text-gray-500 group-hover:text-white">
                        {idx + 1 === 1
                          ? "🥇"
                          : idx + 1 === 2
                          ? "🥈"
                          : idx + 1 === 3
                          ? "🥉"
                          : `#${idx + 1}`}
                      </td>
                      <td class="px-6 py-4 font-medium text-blue-400 capitalize flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                          {entry.userId.substring(0, 2).toUpperCase()}
                        </div>
                        {entry.userId}
                      </td>
                      <td class="px-6 py-4 text-center font-mono text-emerald-400 font-bold">
                        {entry.totalScore}
                      </td>
                      <td class="px-6 py-4 text-center text-gray-400">
                        {entry.testsTaken}
                      </td>
                      <td class="px-6 py-4 text-center text-yellow-400 font-bold">
                        {entry.averageScore}
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        class="px-6 py-12 text-center text-gray-500 italic"
                      >
                        No champions yet. Be the first to take a test!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div class="text-center pt-8">
            <a
              href="/"
              class="text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
