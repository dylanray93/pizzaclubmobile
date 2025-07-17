'use client'

import { signOut } from 'next-auth/react'

export default function Home() {
  return (
    <div className="win95-desktop min-h-screen">
      <div className="win95-menubar">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-bold">🍕 Pizza Club v1.0</span>
            <span className="text-xs">File  Edit  View  Help</span>
          </div>
          <button
            onClick={() => signOut()}
            className="win95-button text-xs"
          >
            Exit
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4">
        <div className="win95-window win95-startup">
          <div className="win95-window-title">
            Pizza Club - Main Menu
          </div>
          <div className="win95-window-content">
            <div className="text-center mb-6">
              <div className="text-xl mb-2 win95-bounce">🍕</div>
              <div className="font-bold text-sm mb-1">Welcome to Pizza Club!</div>
              <div className="text-xs">Track our monthly pizza adventures and rate each spot</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/restaurants" className="win95-window hover:shadow-lg transition-shadow">
                <div className="win95-window-title text-center text-xs">
                  Restaurants.exe
                </div>
                <div className="win95-window-content text-center p-4">
                  <div className="text-2xl mb-2">🍕</div>
                  <div className="text-xs font-bold mb-1">Restaurants</div>
                  <div className="text-xs">View all pizza places</div>
                </div>
              </a>
              
              <a href="/rankings" className="win95-window hover:shadow-lg transition-shadow">
                <div className="win95-window-title text-center text-xs">
                  Rankings.exe
                </div>
                <div className="win95-window-content text-center p-4">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="text-xs font-bold mb-1">Rankings</div>
                  <div className="text-xs">Rate restaurants</div>
                </div>
              </a>
              
              <a href="/members" className="win95-window hover:shadow-lg transition-shadow">
                <div className="win95-window-title text-center text-xs">
                  Members.exe
                </div>
                <div className="win95-window-content text-center p-4">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-xs font-bold mb-1">Members</div>
                  <div className="text-xs">Club directory</div>
                </div>
              </a>

              <a href="/analytics" className="win95-window hover:shadow-lg transition-shadow">
                <div className="win95-window-title text-center text-xs">
                  Analytics.exe
                </div>
                <div className="win95-window-content text-center p-4">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-xs font-bold mb-1">Analytics</div>
                  <div className="text-xs">Data insights</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      <div className="win95-statusbar">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="win95-button text-xs px-2 py-0">
              <span className="win95-blink">●</span> Start
            </button>
            <span className="text-xs">Pizza Club</span>
          </div>
          <div className="text-xs">
            <span id="current-time"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
