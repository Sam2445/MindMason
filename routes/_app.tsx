
import { type PageProps } from "$fresh/server.ts";
import UserIdentity from "../islands/UserIdentity.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MindMason</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; }
          .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </head>
      <body class="bg-gray-900 text-white min-h-screen flex flex-col">
        {/* User Identity Island for global profile handling */}
        <UserIdentity />
        
        <nav class="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center">
                <a href="/" class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                  MindMason
                </a>
                <div class="ml-10 flex items-baseline space-x-4">
                  <a href="/" class="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                  <a href="/history" class="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">History</a>
                  <a href="/leaderboard" class="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors text-yellow-400">Leaderboard</a>
                  <a href="/admin" class="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors text-red-400">Admin</a>
                </div>
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
