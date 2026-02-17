import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>MindMason - Competitive Exam Prep</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-7xl">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center h-[80vh]">
          <h1 class="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-6">
            MindMason
          </h1>
          <p class="text-xl text-gray-300 mb-10 text-center">
            Master your competitive exams with our advanced mock test platform.
            <br />
            Select a category to begin.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <a href="/exams/upsc" class="group relative block p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 overflow-hidden border border-gray-700 hover:border-blue-500">
              <div class="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <h2 class="text-2xl font-bold mb-2 group-hover:text-blue-400">UPSC</h2>
              <p class="text-gray-400">Civil Services Examination Mock Tests</p>
            </a>
            <a href="/exams/ssc" class="group relative block p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 overflow-hidden border border-gray-700 hover:border-emerald-500">
              <div class="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <h2 class="text-2xl font-bold mb-2 group-hover:text-emerald-400">SSC</h2>
              <p class="text-gray-400">Staff Selection Commission Prep</p>
            </a>
            <a href="/exams/hptat" class="group relative block p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 overflow-hidden border border-gray-700 hover:border-purple-500">
              <div class="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <h2 class="text-2xl font-bold mb-2 group-hover:text-purple-400">HPTAT</h2>
              <p class="text-gray-400">Himachal Pradesh Teacher Eligibility Test</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
