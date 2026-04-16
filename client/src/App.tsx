import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './index.css';
import { useWebSocket } from './hooks/useWebSocket';
import { PresenceBar } from './components/PresenceBar';
import { EventStream } from './components/EventStream';
import { HealthPanel } from './components/HealthPanel';
import { EventGenerator } from './components/EventGenerator';
import About from './pages/About';

const STATUS_DOT: Record<string, string> = {
  connected: 'bg-emerald-400',
  connecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-red-400',
};

function Dashboard() {
  const { events, presence, health, status, fireEvent } = useWebSocket();

  return (
    <div className="p-6">
      {/* Status indicator */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
          <span className="capitalize">{status}</span>
        </div>
      </div>

      {/* Health panel */}
      <section className="mb-6">
        <HealthPanel health={health} />
      </section>

      {/* Presence bar */}
      <section className="mb-6 bg-white dark:bg-slate-800/40 rounded-xl px-4 py-3 shadow-sm dark:shadow-none">
        <PresenceBar presence={presence} />
      </section>

      {/* Event stream */}
      <section className="bg-white dark:bg-slate-800/40 rounded-xl p-4 mb-6 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Event Stream
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">{events.length} events</span>
        </div>
        <EventStream events={events} />
      </section>

      {/* Event generator */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Open this page in a second tab, window or machine - events you fire will appear on both screens instantly.
        </p>
        <EventGenerator onFire={fireEvent} disabled={status !== 'connected'} />
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            CommDesk
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              About
            </Link>
            <button
              onClick={() => setDark(d => !d)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71m12.73 0-.71-.71M6.34 6.34l-.71-.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Routes */}
      <div className="max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      <div className="fixed bottom-3 right-4 text-right text-xs pointer-events-none select-none">
        <p className="text-slate-400 dark:text-slate-600">Created by</p>
        <p className="font-medium text-slate-500 dark:text-slate-500">Eric Holt</p>
      </div>
    </div>
  );
}
