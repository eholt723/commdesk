import { HealthStats } from '../types';

interface Props {
  health: HealthStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

function StatCard({ label, value, accent = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-slate-800/60 rounded-xl px-5 py-4 flex flex-col gap-1">
      <span className="text-slate-400 text-xs uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}

export function HealthPanel({ health }: Props) {
  const errorPct = (health.errorRate * 100).toFixed(1);
  const errorAccent =
    health.errorRate > 0.15
      ? 'text-red-400'
      : health.errorRate > 0.05
      ? 'text-yellow-400'
      : 'text-emerald-400';

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Events Processed" value={health.eventsProcessed} accent="text-indigo-300" />
      <StatCard label="Active Connections" value={health.activeConnections} accent="text-sky-300" />
      <StatCard label="Error Rate" value={`${errorPct}%`} accent={errorAccent} />
    </div>
  );
}
