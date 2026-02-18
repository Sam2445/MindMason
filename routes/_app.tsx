import { type PageProps } from "$fresh/server.ts";

interface User {
  id: string;
  username: string;
  role: string;
  targetExam?: string;
}

export default function App({ Component, state }: PageProps) {
  const user = state.user as User | undefined;

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MindMason</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
          body { font-family: 'Inter', sans-serif; }
          .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}
        </style>
      </head>
      <body class="bg-gray-900 text-white min-h-screen flex flex-col">
        
        <nav class="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center gap-8">
                <a
                  href="/"
                  class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
                >
                  MindMason
                </a>
                
                {user && (
                  <div class="hidden md:flex items-baseline space-x-4">
                    <a
                      href="/"
                      class="hover:text-white text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/history"
                      class="hover:text-white text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      History
                    </a>
                    <a
                      href="/leaderboard"
                      class="hover:text-yellow-400 text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Leaderboard
                    </a>
                    {user.role === "ADMIN" && (
                      <a
                        href="/admin"
                        class="hover:text-red-400 text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Admin
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div>
                {user ? (
                   <div class="flex items-center gap-4">
                      <div class="hidden sm:block text-right">
                          <p class="text-sm font-bold text-white leading-none">{user.username}</p>
                          <p class="text-xs text-gray-400 leading-none mt-1">{user.targetExam || "Aspirant"}</p>
                      </div>
                      <a
                        href="/api/logout"
                        class="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        Logout
                      </a>
                   </div>
                ) : (
                   <div class="flex items-center gap-4">
                      <a href="/login" class="text-gray-300 hover:text-white font-medium text-sm">Login</a>
                      <a href="/signup" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">Sign Up</a>
                   </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <div class="flex-grow">
          <Component />
        </div>
      </body>
    </html>
  );
}
