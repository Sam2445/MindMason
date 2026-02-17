import { PageProps, Handlers } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getExamResults, type ExamResult } from "../utils/db.ts";

interface Data {
  results: ExamResult[];
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    // List all results
    const results = await getExamResults();

    return ctx.render({ results });
  },
};

export default function HistoryPage({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>Exam History - MindMason</title>
      </Head>
      <div class="max-w-7xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8 text-gray-100">Your Exam History</h1>
        
        {data.results.length === 0 ? (
          <div class="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
            <p class="text-gray-400 text-lg mb-4">You haven't taken any exams yet.</p>
            <a href="/" class="inline-block px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
              Take a Mock Test
            </a>
          </div>
        ) : (
          <div class="grid gap-4">
            {data.results.map((result) => (
              <div key={result.id} class="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-6">
                    <div class={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                        (result.score / result.totalQuestions) >= 0.6 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                        {Math.round((result.score / result.totalQuestions) * 100)}%
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-200 capitalize">{result.category} Mock Test</h3>
                        <p class="text-gray-400 text-sm">
                            {new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                
                <div class="flex gap-8 text-center">
                    <div>
                        <div class="text-2xl font-bold text-gray-200">{result.score}/{result.totalQuestions}</div>
                        <div class="text-xs text-gray-500 uppercase">Score</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-emerald-400">{result.correctAnswers}</div>
                        <div class="text-xs text-gray-500 uppercase">Correct</div>
                    </div>
                     <div>
                        <div class="text-2xl font-bold text-red-400">{result.totalQuestions - result.correctAnswers}</div>
                        <div class="text-xs text-gray-500 uppercase">Incorrect</div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
