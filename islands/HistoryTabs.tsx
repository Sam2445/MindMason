
import { useState } from "preact/hooks";

interface HistoryTabsProps {
  results: any[];
  duels: any[];
  userId: string;
}

export default function HistoryTabs({ results, duels, userId }: HistoryTabsProps) {
  const [activeTab, setActiveTab] = useState<"mocks" | "duels">("mocks");

  return (
    <>
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-100">Your Progress History</h1>
            <div class="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
                <button 
                    type="button"
                    onClick={() => setActiveTab("mocks")}
                    class={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'mocks' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Mock Tests
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab("duels")}
                    class={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'duels' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Duels History
                </button>
            </div>
        </div>

        {activeTab === "mocks" ? (
            results.length === 0 ? (
                <div class="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 animate-fade-in">
                  <p class="text-gray-400 text-lg mb-4">You haven't taken any mock tests yet.</p>
                  <a href="/" class="inline-block px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">Start Mock Test</a>
                </div>
            ) : (
                <div class="grid gap-4 animate-fade-in">
                  {results.map((result) => (
                    <div key={result.id} class="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all flex flex-col md:flex-row justify-between items-center gap-4 group">
                      <div class="flex items-center gap-6">
                        <div class={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${(result.score / result.totalQuestions) >= 0.6 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"}`}>
                          {Math.round((result.score / result.totalQuestions) * 100)}%
                        </div>
                        <div>
                          <h3 class="text-xl font-bold text-gray-200 capitalize tracking-tight group-hover:text-blue-400 transition-colors">{result.category} Mock Test</h3>
                          <p class="text-gray-500 text-sm">{new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div class="flex gap-8 text-center bg-gray-900/40 p-3 rounded-xl border border-gray-700/50">
                        <div><div class="text-2xl font-bold text-gray-200">{result.score}/{result.totalQuestions}</div><div class="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Score</div></div>
                        <div class="w-px bg-gray-700/50 my-1"></div>
                        <div><div class="text-2xl font-bold text-emerald-400">{result.correctAnswers}</div><div class="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Correct</div></div>
                        <div class="w-px bg-gray-700/50 my-1"></div>
                        <div><div class="text-2xl font-bold text-red-400">{result.totalQuestions - result.correctAnswers}</div><div class="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Incorrect</div></div>
                      </div>
                    </div>
                  ))}
                </div>
            )
        ) : (
            duels.length === 0 ? (
                <div class="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 animate-fade-in">
                  <p class="text-gray-400 text-lg mb-4">You haven't participated in any duels yet.</p>
                  <a href="/" class="inline-block px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">Find a Duel</a>
                </div>
            ) : (
                <div class="grid gap-4 animate-fade-in">
                  {duels.map((duel) => {
                    const isWinner = duel.winnerId === userId;
                    const isDraw = duel.winnerId === null && duel.status === "COMPLETED";
                    const isLoss = duel.winnerId && duel.winnerId !== userId;
                    const isExpired = duel.status === "EXPIRED";
                    const isFinished = duel.status === "COMPLETED" || isExpired;
                    
                    return (
                        <div key={duel.id} class={`bg-gray-800 p-6 rounded-2xl border ${isExpired ? "border-gray-700/50 opacity-70" : "border-gray-700"} hover:border-blue-500/50 transition-all flex flex-col md:flex-row justify-between items-center gap-4 group`}>
                          <div class="flex items-center gap-6">
                            <div class={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isWinner ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : (isLoss ? "bg-red-500/20 text-red-400 border border-red-500/50" : (isExpired ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" : "bg-gray-700 text-gray-400"))}`}>
                              {isWinner ? "🏆" : (isLoss ? "💀" : (isExpired ? "⏱️" : "⚔️"))}
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-200 capitalize tracking-tight group-hover:text-blue-400 transition-colors">
                                    {duel.category} Duel <span class="text-[10px] font-black tracking-widest uppercase opacity-50 px-2 py-0.5 rounded-full bg-gray-700 ml-2">{duel.variant}</span>
                                </h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class={`text-sm font-bold ${isWinner ? "text-emerald-400" : (isLoss ? "text-red-400" : (isDraw ? "text-yellow-400" : (isExpired ? "text-orange-400" : "text-gray-400")))}`}>
                                        {isWinner ? "Victory" : (isLoss ? "Defeat" : (isDraw ? "Draw" : (isExpired ? "Expired" : duel.status)))}
                                    </span>
                                    <span class="text-gray-700">•</span>
                                    <p class="text-gray-500 text-sm italic">{new Date(duel.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                          </div>
                          
                          <div class="flex gap-4 items-center">
                              {isFinished && (
                                  <a 
                                    href={`/duels/review/${duel.id}`}
                                    class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-gray-600 text-gray-200 active:scale-95"
                                  >
                                    Review Match
                                  </a>
                              )}
                              {!isFinished && (
                                   <a 
                                    href={`/duels/${duel.id}`}
                                    class="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-white animate-pulse"
                                   >
                                     Resume
                                   </a>
                              )}
                          </div>
                        </div>
                    );
                  })}
                </div>
            )
        )}
    </>
  );
}
