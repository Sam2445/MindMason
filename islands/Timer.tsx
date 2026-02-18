import { useEffect, useState } from "preact/hooks";

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
}

export default function Timer({ initialSeconds, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / initialSeconds) * 100;
  const color = timeLeft < 60 ? "text-red-500" : "text-emerald-400";

  return (
    <div class="flex items-center space-x-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700 backdrop-blur-sm">
      <div class="relative w-12 h-12 flex items-center justify-center">
        <svg class="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            stroke-width="4"
            fill="transparent"
            class="text-gray-700"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            stroke-width="4"
            fill="transparent"
            stroke-dasharray={2 * Math.PI * 20}
            stroke-dashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
            class={`transition-all duration-1000 ease-linear ${
              timeLeft < 60 ? "text-red-500" : "text-blue-500"
            }`}
          />
        </svg>
      </div>
      <div class={`text-2xl font-mono font-bold ${color}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}
