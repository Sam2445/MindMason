import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import {
  getQuestions,
  getRandomQuestions,
  getMockTestQuestions,
  type Question,
} from "../../utils/db.ts";
import { getSubjectsForExam, type SubjectInfo, EXAM_SUBJECTS, type ExamVariant } from "../../utils/subjects.ts";
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
  variants?: ExamVariant[];
  duration?: number;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const category = ctx.params.category;
    const url = new URL(req.url);
    const countParam = url.searchParams.get("count");
    const subjectParam = url.searchParams.get("subject");
    const variantParam = url.searchParams.get("variant");

    // Handle Exam Variant (Prelims/Mains)
    if (variantParam) {
      const variants = EXAM_SUBJECTS[category.toUpperCase()]?.variants;
      const variant = variants?.find((v) => v.id === variantParam);

      if (variant) {
        let questions: Question[] = [];
        
        if (variant.distribution) {
           questions = await getMockTestQuestions(category, variant.distribution);
        } else {
           questions = await getRandomQuestions(category, variant.totalQuestions);
        }
        
        if (questions.length === 0) return ctx.renderNotFound();

        return ctx.render({
          category,
          questions,
          showSetup: false,
          showSubjectPicker: false, 
          duration: variant.duration * 60 // Convert minutes to seconds
        });
      }
    }

    // Step 1: No subject selected → show subject picker
    if (!subjectParam && !countParam) {
      const subjects = getSubjectsForExam(category);
      const variants = EXAM_SUBJECTS[category.toUpperCase()]?.variants;
      
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
        variants,
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

            {/* Exam Variants (Prelims / Mains) - Dedicated Section */}
            {data.variants && data.variants.length > 0 && (
              <div class="mb-16 animate-fade-in-up">
                <div class="border-l-4 border-purple-500 pl-6 mb-8">
                  <h3 class="text-3xl font-bold text-white mb-2">
                    Official Exam Simulations
                  </h3>
                  <p class="text-gray-400 max-w-2xl">
                    Take full-length mock tests that strictly follow the official exam pattern, 
                    sectional timing, and question distribution as per the syllabus.
                  </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.variants.map((v) => (
                    <a
                      key={v.id}
                      href={`/exams/${category}?variant=${v.id}`}
                      class="relative overflow-hidden group p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 via-gray-900 to-indigo-900/40 border border-purple-500/30 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300"
                    >
                       <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span class="text-9xl">🏛️</span>
                       </div>
                       
                       <div class="relative z-10">
                          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-500/30">
                            OFFICIAL PATTERN
                          </div>
                          
                          <h4 class="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                            {v.label}
                          </h4>
                          
                          <div class="flex items-center gap-6 text-gray-300 text-sm font-medium mt-4">
                             <div class="flex items-center gap-2">
                               <span class="text-lg">⏱️</span> {v.duration} mins
                             </div>
                             <div class="flex items-center gap-2">
                               <span class="text-lg">📝</span> {v.totalQuestions} Questions
                             </div>
                          </div>
                          
                          <div class="mt-8 flex items-center text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                             Start Verification Test 
                             <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                          </div>
                       </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Practice Section */}
            <div class="mb-10">
               <h3 class="text-xl font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-700 pb-2">
                 Topic-wise Practice
               </h3>

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
    if (availableCount && availableCount > 0 && !options.includes(availableCount)) {
      options.push(availableCount);
    }
    options.sort((a, b) => a - b);

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

               {/* Full Length Marathon Option */}
              {availableCount && availableCount >= 50 && (
                <div class="mb-8 p-1">
                  <button
                    type="submit"
                    name="count"
                    value={Math.min(availableCount, 100)}
                    class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-emerald-900/20 transform hover:-translate-y-1 transition-all border border-emerald-500/30 flex items-center justify-center gap-3"
                  >
                    <span>
                      {selectedSubject === 'all' ? "🚀 Start Mixed Practice Marathon" : "🌊 Start Subject Deep Dive"}
                    </span>
                    <span class="bg-black/20 text-xs px-2 py-1 rounded text-emerald-100">
                      {Math.min(availableCount, 100)} Qs
                    </span>
                  </button>
                  <p class="text-xs text-center text-gray-400 mt-2">
                    {selectedSubject === 'all' 
                      ? "A comprehensive practice session with randomized questions across all subjects." 
                      : "Intensive 100-question practice set for this specific subject."}
                  </p>
                </div>
              )}

              <div class="grid grid-cols-2 gap-3 mb-8">
                {options.length > 0 ? (
                  options.map((opt) => (
                    <button
                      key={opt}
                      type="submit"
                      name="count"
                      value={opt}
                      class="py-3 px-4 rounded-xl bg-gray-700 hover:bg-blue-600 hover:text-white border border-gray-600 hover:border-blue-500 transition-all font-bold text-gray-300 shadow-lg"
                    >
                      {opt === availableCount ? "All Questions" : `${opt} Questions`}
                    </button>
                  ))
                ) : (
                  <div class="col-span-2 text-center text-gray-500 italic">
                    No questions available for this subject. Please ask admin to upload questions.
                  </div>
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
        <QuizEngine 
            questions={data.questions!} 
            category={data.category} 
            timeLimit={data.duration} 
        />
      </div>
    </>
  );
}
