import { PageProps, Handlers } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { kv, type Question, seedQuestionsIfEmpty } from "../../utils/db.ts";
import QuizEngine from "../../islands/QuizEngine.tsx";

interface Data {
  category: string;
  questions: Question[];
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const category = ctx.params.category;
    
    // Seed dummy data if needed
    await seedQuestionsIfEmpty();

    const questions: Question[] = [];
    // Fetch from KV
    const iter = kv.list<Question>({ prefix: ["questions", category] });
    for await (const res of iter) {
      questions.push(res.value);
    }

    if (questions.length === 0) {
      return ctx.renderNotFound();
    }

    return ctx.render({ category, questions });
  },
};

export default function ExamPage({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>{data.category.toUpperCase()} Mock Test - MindMason</title>
      </Head>
      <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8">
        <QuizEngine questions={data.questions} category={data.category} />
      </div>
    </>
  );
}
