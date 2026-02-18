interface PaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number>; // index -> optionIndex
  marked: Record<number, boolean>;
  onSelect: (index: number) => void;
}

export default function QuestionPalette(
  { totalQuestions, currentIndex, answers, marked, onSelect }: PaletteProps,
) {
  return (
    <div class="grid grid-cols-5 gap-2 p-4 bg-gray-800 rounded-xl border border-gray-700">
      {Array.from({ length: totalQuestions }).map((_, i) => {
        const isAnswered = answers[i] !== undefined;
        const isMarked = marked[i];
        const isCurrent = i === currentIndex;

        let baseClass =
          "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 border relative group";

        if (isCurrent) {
          baseClass +=
            " bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] transform scale-105 z-10";
        } else if (isMarked) {
          baseClass +=
            " bg-yellow-600/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-600/40";
        } else if (isAnswered) {
          baseClass +=
            " bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/40";
        } else {
          baseClass +=
            " bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200";
        }

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            class={baseClass}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
