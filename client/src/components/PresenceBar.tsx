import type { ConnectedUser } from '../types';

interface Props {
  presence: ConnectedUser[];
}

export function PresenceBar({ presence }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presence.length === 0 && (
        <span className="text-slate-400 dark:text-slate-500 text-sm">No users connected</span>
      )}
      {presence.map((user) => (
        <div
          key={user.clientId}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-slate-200 dark:ring-slate-800 transition-all duration-300"
          style={{ backgroundColor: user.color }}
          title={`Connected at ${new Date(user.connectedAt).toLocaleTimeString()}`}
        >
          {user.initials}
        </div>
      ))}
      <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
        {presence.length} {presence.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
}
