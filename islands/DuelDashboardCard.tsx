
import { useState } from "preact/hooks";

interface DuelDashboardCardProps {
    userTarget: string;
    // deno-lint-ignore no-explicit-any
    subjectCounts: any[];
}

// Subjects per exam (client-side copy for the island)
const EXAM_SUBJECT_MAP: Record<string, { id: string; label: string; icon: string }[]> = {
    BANKING: [
        { id: "all", label: "All Subjects", icon: "📚" },
        { id: "quantitative_aptitude", label: "Quant", icon: "🔢" },
        { id: "reasoning", label: "Reasoning", icon: "🧩" },
        { id: "english", label: "English", icon: "📝" },
        { id: "general_awareness", label: "GK/GA", icon: "🌍" },
        { id: "computer_knowledge", label: "Computer", icon: "💻" },
    ],
    UPSC: [
        { id: "all", label: "All Subjects", icon: "📚" },
        { id: "polity", label: "Polity", icon: "🏛️" },
        { id: "history", label: "History", icon: "📜" },
        { id: "geography", label: "Geography", icon: "🗺️" },
        { id: "economics", label: "Economics", icon: "📊" },
        { id: "science_technology", label: "Science", icon: "🔬" },
        { id: "current_affairs", label: "Current Affairs", icon: "📰" },
    ],
    SSC: [
        { id: "all", label: "All Subjects", icon: "📚" },
        { id: "quantitative_aptitude", label: "Quant", icon: "🔢" },
        { id: "reasoning", label: "Reasoning", icon: "🧩" },
        { id: "english", label: "English", icon: "📝" },
        { id: "general_awareness", label: "GK/GA", icon: "🌍" },
    ],
    RAILWAYS: [
        { id: "all", label: "All Subjects", icon: "📚" },
        { id: "mathematics", label: "Math", icon: "🔢" },
        { id: "reasoning", label: "Reasoning", icon: "🧩" },
        { id: "general_science", label: "Science", icon: "🔬" },
        { id: "general_awareness", label: "GK", icon: "🌍" },
    ],
    DEFENCE: [
        { id: "all", label: "All Subjects", icon: "📚" },
        { id: "mathematics", label: "Math", icon: "🔢" },
        { id: "english", label: "English", icon: "📝" },
        { id: "general_knowledge", label: "GK", icon: "🌍" },
    ],
};

const DEFAULT_SUBJECTS = [
    { id: "all", label: "All Subjects", icon: "📚" },
];

export default function DuelDashboardCard({ userTarget, subjectCounts }: DuelDashboardCardProps) {
    const [variant, setVariant] = useState("STANDARD");
    const [subject, setSubject] = useState("all");

    // Filter available subjects based on counts
    // We always include "all" (if there are any questions at all, logic could vary but let's keep it simple)
    const allDefinedSubjects = EXAM_SUBJECT_MAP[userTarget.toUpperCase()] || DEFAULT_SUBJECTS;
    
    // Create a set of available subject IDs from the DB count
    const availableSubjectIds = new Set(subjectCounts.map(s => s.subject));
    
    // Always include 'all', and any subject that has questions in DB
    const subjects = allDefinedSubjects.filter(s => s.id === "all" || availableSubjectIds.has(s.id));

    return (
        <div class="bg-gradient-to-br from-red-900/40 to-orange-900/40 p-6 rounded-xl border border-orange-500/30 col-span-1 md:col-span-2 flex flex-col gap-6 group relative overflow-hidden">
            <div class="relative z-10 flex-1">
                <h3 class="text-2xl font-bold text-orange-400 mb-2 flex items-center gap-2">
                    ⚔️ Duel Mode <span class="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">Beta</span>
                </h3>
                <p class="text-gray-300 max-w-lg mb-4">
                    Challenge other aspirants in real-time battles on specific subjects.
                </p>
                
                {/* Variant Selector */}
                <div class="flex flex-wrap gap-2 text-sm z-20 relative mb-3">
                    <span class="text-gray-500 text-xs uppercase tracking-wider self-center mr-1">Mode:</span>
                    {["STANDARD", "RAPID", "BLITZ"].map(v => (
                        <button 
                            type="button"
                            key={v}
                            onClick={() => setVariant(v)}
                            class={`px-3 py-1 rounded-full border transition-all ${
                                variant === v 
                                ? "bg-orange-500/20 border-orange-500 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
                                : "bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700"
                            }`}
                        >
                            {v.charAt(0) + v.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Subject Selector (Dropdown) */}
                <div class="flex flex-wrap gap-2 text-sm z-20 relative">
                    <span class="text-gray-500 text-xs uppercase tracking-wider self-center mr-1">Subject:</span>
                    <div class="relative">
                        <select
                            value={subject}
                            onChange={(e) => setSubject((e.target as HTMLSelectElement).value)}
                            class="appearance-none bg-gray-800/80 border border-gray-600 text-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[180px]"
                        >
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                         <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end relative z-10">
                <a
                    href={`/duels/join?mode=queue&category=${userTarget}&variant=${variant}&subject=${subject}`}
                    class="px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg text-white font-bold shadow-lg shadow-orange-600/20 hover:scale-105 transition-all text-center min-w-[160px]"
                >
                    Find {variant.charAt(0) + variant.slice(1).toLowerCase()} Match
                </a>
            </div>
            
            <div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-600/10 to-transparent pointer-events-none"></div>
        </div>
    );
}
