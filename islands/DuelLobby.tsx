
import { useEffect, useState } from "preact/hooks";

interface DuelLobbyProps {
  duelId: string;
  category: string;
}

export default function DuelLobby({ duelId, category }: DuelLobbyProps) {
  const [dots, setDots] = useState("");
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + "." : "");
    }, 500);

    const timer = setInterval(() => {
        setWaited(prev => prev + 1);
    }, 1000);

    const checkStatus = setInterval(async () => {
        try {
            const res = await fetch(`/api/duel/status?id=${duelId}`);
            const data = await res.json();
            if (data.status === "ACTIVE") {
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        }
    }, 2000);

    return () => {
        clearInterval(interval);
        clearInterval(timer);
        clearInterval(checkStatus);
    };
  }, [duelId]);

  const handleCallBot = async () => {
      try {
          await fetch(`/api/duel/bot?id=${duelId}`, { method: "POST" });
          // Status check will catch the update
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 text-center space-y-8">
        <div class="relative w-32 h-32 mx-auto">
             <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
             <div class="relative bg-gray-700 rounded-full w-full h-full flex items-center justify-center border-2 border-blue-500">
                <span class="text-4xl">⚔️</span>
             </div>
        </div>

        <div>
            <h2 class="text-2xl font-bold text-white mb-2">Finding Opponent{dots}</h2>
            <p class="text-gray-400">Searching for a worthy challenger in <span class="capitalize font-bold text-blue-400">{category}</span></p>
        </div>

        {waited > 5 && (
            <div class="animate-fade-in">
                <p class="text-sm text-gray-500 mb-4">Taking too long?</p>
                <button 
                    onClick={handleCallBot}
                    class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-medium transition-colors border border-gray-600"
                >
                    Challenge AI Bot 🤖
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
