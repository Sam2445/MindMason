
import { PageProps, Handlers } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getQuestions, getRandomQuestions, seedQuestionsIfEmpty, type Question } from "../../utils/db.ts";
import QuizEngine from "../../islands/QuizEngine.tsx";

interface Data {
  category: string;
  questions?: Question[];
  availableCount?: number;
  showSetup: boolean;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const category = ctx.params.category;
    const url = new URL(req.url);
    const countParam = url.searchParams.get("count");
    
    // Seed database if empty just in case
    await seedQuestionsIfEmpty();

    if (!countParam) {
        // Setup Mode: Get total count to show options
        const all = await getQuestions(category);
        return ctx.render({ 
            category, 
            availableCount: all.length,
            showSetup: true 
        });
    }

    // Quiz Mode: Get randomized questions
    const limit = parseInt(countParam);
    const questions = await getRandomQuestions(category, limit);

    if (questions.length === 0) {
      return ctx.renderNotFound();
    }

    return ctx.render({ category, questions, showSetup: false });
  },
};

export default function ExamPage({ data }: PageProps<Data>) {
  if (data.showSetup) {
      const { category, availableCount } = data;
      const options = [10, 20, 30, 50, 100].filter(c => c <= (availableCount || 0));
      // Always add "All" option if available > 0
      if (availableCount && availableCount > 0) {
          if (!options.includes(availableCount)) options.push(availableCount);
      }

      return (
        <>
          <Head>
            <title>Configure {category.toUpperCase()} Test - MindMason</title>
          </Head>
          <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
             <div class="max-w-md w-full bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8 space-y-8 animate-fade-in-up">
                 <div class="text-center">
                     <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 capitalize mb-2">
                        {category} Mock Test
                     </h1>
                     <p class="text-gray-400">Configure your exam settings below.</p>
                 </div>

                 <div class="p-6 bg-gray-700/30 rounded-xl border border-gray-600/50">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-300">Available Questions</span>
                        <span class="text-emerald-400 font-bold bg-emerald-900/40 px-3 py-1 rounded-full text-sm">
                            {availableCount}
                        </span>
                    </div>
                 </div>

                 <form>
                     <label class="block text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">
                        Select Number of Questions
                     </label>
                     <div class="grid grid-cols-2 gap-3 mb-8">
                         {options.length > 0 ? options.map(opt => (
                             <button 
                                key={opt}
                                type="submit" 
                                name="count" 
                                value={opt}
                                class="py-3 px-4 rounded-xl bg-gray-700 hover:bg-blue-600 hover:text-white border border-gray-600 hover:border-blue-500 transition-all font-bold text-gray-300 shadow-lg"
                             >
                                 {opt === availableCount ? "All Questions" : `${opt} Questions`}
                             </button>
                         )) : (
                             <div class="col-span-2 text-center text-gray-500 italic">
                                 No questions available. Please ask admin to upload questions.
                             </div>
                         )}
                         
                         {/* Fallback if no specific options fit but count > 0 */}
                         {options.length === 0 && availableCount && availableCount > 0 && (
                            <button 
                                type="submit" 
                                name="count" 
                                value={availableCount}
                                class="col-span-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold"
                             >
                                Start All ({availableCount})
                            </button>
                         )}
                     </div>
                 </form>

                 <div class="text-center">
                    <a href="/" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        Cancel and return home
                    </a>
                 </div>
             </div>
          </div>
        </>
      );
  }

  // Quiz Mode
  return (
    <>
      <Head>
        <title>{data.category.toUpperCase()} Mock Test - MindMason</title>
      </Head>
      <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8">
        <QuizEngine questions={data.questions!} category={data.category} />
      </div>
    </>
  );
}
