
import { useEffect, useState } from "preact/hooks";

export default function UserIdentity() {
  const [name, setName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user_name");
    if (stored) {
      setName(stored);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleSave = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("username") as HTMLInputElement;
    if (input.value.trim()) {
        const val = input.value.trim();
        localStorage.setItem("user_name", val);
        setName(val);
        setShowModal(false);
    }
  };

  if (name) {
      return (
          <div class="fixed top-4 right-4 z-50 bg-gray-800/80 backdrop-blur px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-300 flex items-center gap-2 group cursor-pointer hover:bg-gray-700 transition-colors"
               onClick={() => { if(confirm('Change user?')) { localStorage.removeItem('user_name'); window.location.reload(); } }}>
              <div class="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                  {name[0].toUpperCase()}
              </div>
              {name}
          </div>
      );
  }

  if (showModal) {
      return (
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-sm w-full mx-4 animate-scale-up">
                <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                    Welcome to MindMason
                </h2>
                <p class="text-gray-400 mb-6 text-sm">Enter your name to track your progress and join the leaderboard.</p>
                
                <form onSubmit={handleSave} class="space-y-4">
                    <input 
                        type="text" 
                        name="username" 
                        placeholder="Your Name" 
                        class="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-500"
                        autoFocus
                        required
                    />
                    <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                        Start Journey
                    </button>
                    <div class="text-xs text-center text-gray-500 mt-4">
                        * This name will appear on the leaderboard
                    </div>
                </form>
            </div>
        </div>
      );
  }

  return null;
}
