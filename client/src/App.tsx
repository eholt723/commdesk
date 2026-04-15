import './index.css';
import { useWebSocket } from './hooks/useWebSocket';
import { PresenceBar } from './components/PresenceBar';
import { EventStream } from './components/EventStream';
import { HealthPanel } from './components/HealthPanel';
import { EventGenerator } from './components/EventGenerator';

const STATUS_DOT: Record<string, string> = {
  connected: 'bg-emerald-400',
  connecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-red-400',
};

export default function App() {
  const { events, presence, health, status, fireEvent } = useWebSocket();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CommDesk</h1>
          <p className="text-slate-400 text-sm">Real-time operations dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
          <span className="capitalize">{status}</span>
        </div>
      </header>

      {/* Health panel */}
      <section className="mb-6">
        <HealthPanel health={health} />
      </section>

      {/* Presence bar */}
      <section className="mb-6 bg-slate-800/40 rounded-xl px-4 py-3">
        <PresenceBar presence={presence} />
      </section>

      {/* Event stream */}
      <section className="bg-slate-800/40 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Event Stream
          </h2>
          <span className="text-xs text-slate-500">{events.length} events</span>
        </div>
        <EventStream events={events} />
      </section>

      {/* Event generator */}
      <div className="flex justify-center">
        <EventGenerator onFire={fireEvent} disabled={status !== 'connected'} />
      </div>
    </div>
  );
}
