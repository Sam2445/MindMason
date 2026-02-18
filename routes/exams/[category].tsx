import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import {
  getQuestions,
  getRandomQuestions,
  type Question,
} from "../../utils/db.ts";
import { getSubjectsForExam, type SubjectInfo } from "../../utils/subjects.ts";
import QuizEngine from "../../islands/QuizEngine.tsx";

interface Data {
  category: string;
  questions?: Question[];
  availableCount?: number;
  showSetup: boolean;
  showSubjectPicker: boolean;
  subjects?: SubjectInfo[];
  selectedSubject?: string;
  subjectCounts?: Record<string, number>;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const category = ctx.params.category;
    const url = new URL(req.url);
    const countParam = url.searchParams.get("count");
    const subjectParam = url.searchParams.get("subject");

    // Seed check removed for performance/stability


    // Step 1: No subject selected → show subject picker
    if (!subjectParam && !countParam) {
      const subjects = getSubjectsForExam(category);
      
      // Get question counts per subject
      const subjectCounts: Record<string, number> = {};
      let totalCount = 0;
      for (const s of subjects) {
        const qs = await getQuestions(category, s.id);
        subjectCounts[s.id] = qs.length;
        totalCount += qs.length;
      }
      subjectCounts["all"] = totalCount;

      return ctx.render({
        category,
        showSubjectPicker: true,
        showSetup: false,
        subjects,
        subjectCounts,
      });
    }

    // Step 2: Subject selected but no count → show question count picker
    if (subjectParam && !countParam) {
      const all = await getQuestions(category, subjectParam);
      return ctx.render({
        category,
        availableCount: all.length,
        showSetup: true,
        showSubjectPicker: false,
        selectedSubject: subjectParam,
      });
    }

    // Step 3: Both subject and count selected → start quiz
    const limit = parseInt(countParam!);
    const questions = await getRandomQuestions(category, limit, subjectParam || undefined);

    if (questions.length === 0) {
      return ctx.renderNotFound();
    }

    return ctx.render({ category, questions, showSetup: false, showSubjectPicker: false, selectedSubject: subjectParam || undefined });
  },
};

export default function ExamPage({ data }: PageProps<Data>) {
  // Step 1: Subject Picker
  if (data.showSubjectPicker) {
    const { category, subjects, subjectCounts } = data;
    
    return (
      <>
        <Head>
          <title>{category.toUpperCase()} - Choose Subject - MindMason</title>
        </Head>
        <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-10 animate-fade-in">
              <a href="/" class="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 inline-block">
                ← Back to Dashboard
              </a>
              <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 capitalize mb-3">
                {category} Preparation
              </h1>
              <p class="text-gray-400 text-lg">Choose a subject to practice</p>
            </div>

            {/* All Subjects Option */}
            <a
              href={`/exams/${category}?subject=all`}
              class="block mb-6 p-6 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-2xl border-2 border-blue-500/30 hover:border-blue-400 transition-all group"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                  <span class="text-3xl">📚</span>
                  <div>
                    <h3 class="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">All Subjects (Mixed)</h3>
                    <p class="text-gray-400 text-sm">Practice questions from all subjects combined</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">
                    {subjectCounts?.["all"] || 0} Qs
                  </span>
                  <svg class="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </a>

            {/* Individual Subjects */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects?.map((subject) => {
                const count = subjectCounts?.[subject.id] || 0;
                const hasQuestions = count > 0;
                
                return (
                  <a
                    key={subject.id}
                    href={hasQuestions ? `/exams/${category}?subject=${subject.id}` : undefined}
                    class={`p-5 rounded-xl border transition-all duration-300 group ${
                      hasQuestions 
                        ? `bg-gray-800/80 border-gray-700 hover:border-${subject.color}-500 hover:bg-gray-700/80 cursor-pointer` 
                        : "bg-gray-800/40 border-gray-800 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex items-start gap-3">
                        <span class="text-2xl mt-0.5">{subject.icon}</span>
                        <div>
                          <h3 class={`text-lg font-bold ${hasQuestions ? 'text-white' : 'text-gray-500'} group-hover:text-${subject.color}-400 transition-colors`}>
                            {subject.label}
                          </h3>
                          <p class="text-gray-500 text-sm mt-1">{subject.description}</p>
                        </div>
                      </div>
                      <span class={`text-xs font-bold px-2 py-1 rounded-full ${
                        hasQuestions 
                          ? `bg-${subject.color}-500/20 text-${subject.color}-300` 
                          : "bg-gray-700 text-gray-500"
                      }`}>
                        {count} Qs
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>

            <div class="text-center mt-8">
              <a href="/" class="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Cancel and return home
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 2: Question Count Picker
  if (data.showSetup) {
    const { category, availableCount, selectedSubject } = data;
    const options = [10, 20, 30, 50, 100].filter((c) =>
      c <= (availableCount || 0)
    );
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
              {selectedSubject && selectedSubject !== "all" && (
                <p class="text-blue-400 font-medium capitalize">
                  {selectedSubject.replace(/_/g, " ")}
                </p>
              )}
              <p class="text-gray-400 mt-1">Configure your exam settings below.</p>
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
              {selectedSubject && (
                <input type="hidden" name="subject" value={selectedSubject} />
              )}
              <label class="block text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">
                Select Number of Questions
              </label>
              <div class="grid grid-cols-2 gap-3 mb-8">
                {options.length > 0
                  ? options.map((opt) => (
                    <button
                      key={opt}
                      type="submit"
                      name="count"
                      value={opt}
                      class="py-3 px-4 rounded-xl bg-gray-700 hover:bg-blue-600 hover:text-white border border-gray-600 hover:border-blue-500 transition-all font-bold text-gray-300 shadow-lg"
                    >
                      {opt === availableCount
                        ? "All Questions"
                        : `${opt} Questions`}
                    </button>
                  ))
                  : (
                    <div class="col-span-2 text-center text-gray-500 italic">
                      No questions available for this subject. Please ask admin to upload
                      questions.
                    </div>
                  )}

                {options.length === 0 && availableCount && availableCount > 0 &&
                  (
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

            <div class="text-center space-y-2">
              <a
                href={`/exams/${category}`}
                class="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Choose different subject
              </a>
              <a
                href="/"
                class="block text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancel and return home
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 3: Quiz Mode
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
