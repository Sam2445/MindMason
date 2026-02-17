
import { useEffect, useState } from "preact/hooks";
import Timer from "./Timer.tsx";
import QuestionPalette from "./QuestionPalette.tsx";
import { type Question } from "../utils/db.ts";

interface QuizEngineProps {
  questions: Question[];
  category: string;
}

export default function QuizEngine({ questions, category }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{correct: number, wrong: number, score: number} | null>(null);
  
  // Persistence state
  const [hydrated, setHydrated] = useState(false);
  const [initialTime, setInitialTime] = useState(60 * 10); // Default 10 mins

  // Derive current question
  const currentQuestion = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  // Restore state from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
       const key = `quiz_session_${category}`;
       try {
           const stored = localStorage.getItem(key);
           if (stored) {
              const data = JSON.parse(stored);
              // Restore answers and marks
              if (data.answers) setAnswers(data.answers);
              if (data.marked) setMarked(data.marked);
              
              // Calculate remaining time
              if (data.startTime) {
                  const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
                  const remaining = (60 * 10) - elapsed;
                  if (remaining <= 0) {
                     // Time already passed
                     setInitialTime(0);
                     // We should auto-submit here, but let's wait for hydration to complete
                     // handleSubmit() will be called by Timer or effect
                  } else {
                     setInitialTime(remaining);
                  }
              }
           } else {
              // Start new session
              localStorage.setItem(key, JSON.stringify({
                 startTime: Date.now(),
                 answers: {},
                 marked: {}
              }));
           }
       } catch (e) {
           console.error("Failed to restore session", e);
       }
       setHydrated(true);
    }
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
     if (typeof window !== "undefined" && hydrated && !submitted) {
        const key = `quiz_session_${category}`;
        const existingStr = localStorage.getItem(key);
        const existing = existingStr ? JSON.parse(existingStr) : { startTime: Date.now() };
        
        localStorage.setItem(key, JSON.stringify({
           ...existing,
           answers,
           marked
        }));
     }
  }, [answers, marked, hydrated, submitted]);

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex,
    }));
  };

  const toggleMarked = () => {
    if (submitted) return;
    setMarked((prev) => ({
        ...prev,
        [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const calculateResults = () => {
      let correct = 0;
      let wrong = 0;
      questions.forEach((q, idx) => {
          const ans = answers[idx];
          if (ans !== undefined) {
              if (ans === q.correctIndex) correct++;
              else wrong++;
          }
      });
      return { correct, wrong, score: correct };
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    
    // Clear session
    if (typeof window !== "undefined") {
        localStorage.removeItem(`quiz_session_${category}`);
    }

    const res = calculateResults();
    setResult(res);

    // Send to API
    try {
        let userName = "guest-user";
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user_name");
            if (stored) userName = stored;
        }

        await fetch("/api/submit-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: crypto.randomUUID(),
                userId: userName,
                category,
                score: res.score,
                totalQuestions: questions.length,
                correctAnswers: res.correct,
                timeTaken: (60 * 10) - initialTime, // Approximate
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error("Failed to submit score", e);
    }
  };

  // Wait for hydration to avoid mismatch and correct timer init
  if (!hydrated && typeof window !== "undefined") {
      return <div class="p-8 text-center text-gray-400">Loading session...</div>;
  }
  
  if (!currentQuestion) return <div>Loading...</div>;

  if (submitted && result) {
      return (
        <div class="w-full max-w-4xl mx-auto p-8">
            <div class="bg-gray-800 border-gray-700 rounded-2xl shadow-2xl p-8 text-center space-y-8 animate-fade-in-up">
                <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Exam Completed!
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div class="text-4xl font-bold text-blue-400 mb-2">{result.score}/{questions.length}</div>
                        <div class="text-gray-400 uppercase tracking-wider text-sm">Total Score</div>
                    </div>
                     <div class="p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div class="text-4xl font-bold text-emerald-400 mb-2">{result.correct}</div>
                        <div class="text-gray-400 uppercase tracking-wider text-sm">Correct Answers</div>
                    </div>
                     <div class="p-6 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div class="text-4xl font-bold text-red-400 mb-2">{result.wrong}</div>
                        <div class="text-gray-400 uppercase tracking-wider text-sm">Incorrect</div>
                    </div>
                </div>

                <div class="flex justify-center gap-4 pt-8">
                    <a href="/" class="px-8 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all">
                        Back to Home
                    </a>
                     <button onClick={() => window.location.reload()} class="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all">
                        Retake Exam
                    </button>
                </div>
            </div>
            
            <div class="mt-12">
                <h3 class="text-2xl font-bold text-gray-300 mb-6">Detailed Analysis</h3>
                <div class="space-y-4">
                    {questions.map((q, idx) => {
                        const userAns = answers[idx];
                        const isCorrect = userAns === q.correctIndex;
                        const isSkipped = userAns === undefined;
                        
                        return (
                            <div key={q.id} class={`p-6 rounded-xl border ${isCorrect ? 'border-emerald-500/30 bg-emerald-900/10' : isSkipped ? 'border-gray-600 bg-gray-800' : 'border-red-500/30 bg-red-900/10'}`}>
                                <div class="flex items-start gap-4">
                                    <div class={`mt-1 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-emerald-500 text-white' : isSkipped ? 'bg-gray-600 text-gray-300' : 'bg-red-500 text-white'}`}>
                                        {idx + 1}
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="text-lg font-medium text-gray-200 mb-3">{q.text}</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {q.options.map((opt, optIdx) => (
                                                <div class={`px-4 py-2 rounded-lg text-sm ${
                                                    optIdx === q.correctIndex 
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                                        : optIdx === userAns 
                                                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                            : 'bg-gray-700/30 text-gray-400'
                                                }`}>
                                                    {opt} {optIdx === q.correctIndex && "✓"} {optIdx === userAns && optIdx !== q.correctIndex && "✗"}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div class="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto p-4">
      {/* Main Question Area */}
      <div class="flex-1 space-y-6">
        {/* Header */}
        <div class="flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur border border-gray-700 rounded-xl">
             <div>
                <h2 class="text-xl font-bold text-gray-100 uppercase tracking-wider">{category} Mock Test</h2>
                <span class="text-sm text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
             </div>
             {/* Key on Timer forces remount if initialTime changes */}
             <Timer key={initialTime} initialSeconds={initialTime} onTimeUp={handleSubmit} /> 
        </div>

        {/* Question Card */}
        <div class="p-8 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl min-h-[400px] flex flex-col justify-between relative overflow-hidden group">
             <div>
                <div class="flex justify-between items-start mb-6">
                   <h3 class="text-2xl font-serif font-medium text-gray-100 leading-relaxed pr-8">
                     {currentQuestion.text}
                   </h3>
                   <button 
                      onClick={toggleMarked}
                      class={`p-2 rounded-lg transition-colors ${marked[currentIdx] ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/50' : 'text-gray-500 hover:bg-gray-700'}`}
                      title="Mark for Review"
                   >
                     {/* Bookmark Icon */}
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill={marked[currentIdx] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                     </svg>
                   </button>
                </div>

                <div class="space-y-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers[currentIdx] === idx;
                    
                    let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center group/btn ";
                    
                    if (submitted) {
                       // ... disabled style
                       btnClass += "border-gray-700 bg-gray-800/50 opacity-50";
                    } else {
                        if (isSelected) btnClass += "bg-blue-600 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/50";
                        else btnClass += "bg-gray-700/30 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-300";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={submitted}
                        class={btnClass}
                      >
                        <span class={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold border ${isSelected ? 'bg-white text-blue-600 border-white' : 'border-gray-500 text-gray-500 group-hover/btn:border-gray-400 group-hover/btn:text-gray-300'}`}>
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
             </div>

             {/* Footer Nav */}
             <div class="flex justify-between mt-8 pt-6 border-t border-gray-700">
                <button 
                  onClick={handlePrev} 
                  disabled={currentIdx === 0}
                  class="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-300"
                >
                  Previous
                </button>
                
                {!submitted ? (
                    isLast ? (
                     <button 
                      onClick={handleSubmit}
                      class="px-8 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                     >
                      Submit Test
                     </button>
                    ) : (
                      <button 
                        onClick={handleNext}
                        class="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                      >
                        Next Question
                      </button>
                    )
                ) : (
                    <div class="text-emerald-400 font-bold flex items-center">
                        Exam Submitted
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* Sidebar Palette */}
      <div class="w-full md:w-80 space-y-6">
        <div class="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-xl p-4">
             <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Question Palette</h3>
             <QuestionPalette 
               totalQuestions={questions.length} 
               currentIndex={currentIdx} 
               answers={answers} 
               marked={marked}
               onSelect={setCurrentIdx} 
             />
             
             <div class="mt-6 col-span-2 text-xs text-gray-400 space-y-2">
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-blue-600 border border-blue-400"></div> Current
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-emerald-600/20 border border-emerald-500/50"></div> Answered
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-yellow-600/20 border border-yellow-500/50"></div> Marked for Review
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-gray-700 border border-gray-600"></div> Unvisited
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
