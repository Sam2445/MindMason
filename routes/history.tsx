import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { type ExamResult, getExamResults } from "../utils/db.ts";
import { getUserDuels } from "../utils/duels.ts";
import { getCookies } from "$std/http/cookie.ts";
import HistoryTabs from "../islands/HistoryTabs.tsx";

interface Data {
  results: ExamResult[];
  duels: any[];
  userId: string;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;
    if (!userId) {
        return new Response("", { status: 303, headers: { Location: "/login" } });
    }

    const results = await getExamResults();
    const duels = await getUserDuels(userId);

    // Filter results for this user
    const userResults = results.filter(r => r.userId === userId);

    return ctx.render({ results: userResults, duels, userId });
  },
};

export default function HistoryPage({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>History - MindMason</title>
      </Head>
      <div class="max-w-7xl mx-auto px-4 py-8">
         <HistoryTabs results={data.results} duels={data.duels} userId={data.userId} />
      </div>
    </>
  );
}
