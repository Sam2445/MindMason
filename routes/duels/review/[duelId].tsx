
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getDuelStatus } from "../../../utils/duels.ts";
import { getUser, Question } from "../../../utils/db.ts";
import { getCookies } from "$std/http/cookie.ts";

interface Data {
  duel: any;
  questions: Question[];
  userId: string;
  player1: any;
  player2: any;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const userId = cookies.auth;
    const duelId = ctx.params.duelId;

    if (!userId) {
      return new Response(null, { headers: { Location: "/login" }, status: 302 });
    }

    const duel = await getDuelStatus(duelId);
    if (!duel || (duel.status !== "COMPLETED" && duel.status !== "EXPIRED")) {
       return new Response("Duel not found or not finished", { status: 404 });
    }

    const questions: Question[] = duel.questions ? JSON.parse(duel.questions) : [];
    const p1 = await getUser(duel.player1Id);
    const p2 = await getUser(duel.player2Id!);

    return ctx.render({ duel, questions, userId, player1: p1, player2: p2 });
  }
};

export default function DuelReviewPage({ data }: PageProps<Data>) {
  const { duel, questions, userId, player1, player2 } = data;
  
  const p1Progress = JSON.parse(duel.player1Progress || "{}");
  const p2Progress = JSON.parse(duel.player2Progress || "{}");

  const isP1 = duel.player1Id === userId;
  const myProgress = isP1 ? p1Progress : p2Progress;
  const oppProgress = isP1 ? p2Progress : p1Progress;
  const myName = isP1 ? (player1?.username || "Player 1") : (player2?.username || "Player 2");
  const oppName = isP1 ? (player2?.username || "Opponent") : (player1?.username || "Opponent");
  const isExpired = duel.status === "EXPIRED";

  // Determine which questions were actually answered
  const myAnsweredCount = Object.keys(myProgress.answers || {}).length;

  return (
    <div class="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <Head>
        <title>Duel Review - {duel.category}</title>
      </Head>

      <div class="max-w-4xl mx-auto space-y-8">
        <div class="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
           <div>
               <h1 class="text-3xl font-bold text-gray-100 uppercase tracking-tight">{duel.category} Duel Review</h1>
               <p class="text-gray-400 mt-1">Played on {new Date(duel.createdAt).toLocaleDateString()}</p>
               {isExpired && (
                 <span class="inline-block mt-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold border border-orange-500/30">
                   ⏱️ Duel Expired — showing {myAnsweredCount} of {questions.length} answered questions
                 </span>
               )}
               {!isExpired && myAnsweredCount < questions.length && (
                 <span class="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">
                   Exited early — showing {myAnsweredCount} of {questions.length} answered questions
                 </span>
               )}
           </div>
           <div class="text-right">
                <div class="text-xs text-gray-500 uppercase tracking-widest mb-1">Final Score</div>
                <div class="flex items-center gap-4 text-3xl font-black">
                     <span class="text-blue-400">{p1Progress.score || 0}</span>
                     <span class="text-gray-600">VS</span>
                     <span class="text-emerald-400">{p2Progress.score || 0}</span>
                </div>
           </div>
        </div>

        <div class="space-y-6">
          {questions.map((q, idx) => {
            const myAns = myProgress.answers?.[idx]?.answerIndex;
            const oppAns = oppProgress.answers?.[idx]?.answerIndex;
            const correctIdx = q.correctIndex;
            const wasAnswered = myAns !== undefined || oppAns !== undefined;

            // Skip unanswered questions
            if (!wasAnswered) return null;
            
            return (
              <div key={idx} class="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-lg animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div class="p-6 border-b border-gray-700 bg-gray-700/30">
                   <div class="flex justify-between items-start mb-4">
                        <span class="px-3 py-1 bg-gray-900 rounded-full text-xs font-bold text-gray-400">Question {idx + 1}</span>
                        {myAns === correctIdx ? 
                            <span class="text-emerald-400 font-bold flex items-center gap-1 text-sm"><span class="text-lg">✓</span> You got it right</span> :
                            <span class="text-red-400 font-bold flex items-center gap-1 text-sm"><span class="text-lg">✗</span> You missed this</span>
                        }
                   </div>
                   <h3 class="text-xl font-medium text-white leading-relaxed">{q.text}</h3>
                </div>

                <div class="p-6 space-y-3">
                  {q.options.map((opt, optIdx) => {
                    let optClass = "p-4 rounded-xl border transition-all flex items-center justify-between ";
                    
                    const isCorrect = optIdx === correctIdx;
                    const isMyAns = optIdx === myAns;
                    const isOppAns = optIdx === oppAns;

                    if (isCorrect) {
                        optClass += "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 ";
                    } else if (isMyAns) {
                        optClass += "bg-red-500/10 border-red-500/50 text-red-300 ";
                    } else {
                        optClass += "bg-gray-900/50 border-gray-700 text-gray-400 ";
                    }

                    return (
                      <div key={optIdx} class={optClass}>
                        <div class="flex items-center gap-4">
                            <span class={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                        </div>
                        <div class="flex gap-2">
                            {isMyAns && <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">YOU</span>}
                            {isOppAns && <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/30">OPPONENT</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                    <div class="p-6 bg-blue-500/5 border-t border-gray-700">
                        <div class="flex items-center gap-2 mb-2">
                             <span class="text-blue-400 font-bold text-sm uppercase tracking-wider">Explanation</span>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed">{q.explanation}</p>
                    </div>
                )}
              </div>
            );
          })}
        </div>

        <div class="text-center py-12">
            <a href="/history" class="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2">
                ← Back to History
            </a>
        </div>
      </div>
    </div>
  );
}
