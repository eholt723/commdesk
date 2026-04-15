import { ConnectedUser } from './types';

const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ef4444', // red
  '#14b8a6', // teal
];

let colorIndex = 0;

function nextColor(): string {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  colorIndex++;
  return color;
}

function generateInitials(): string {
  const names = [
    'AJ', 'BK', 'CL', 'DM', 'EN', 'FO', 'GP', 'HQ',
    'IR', 'JS', 'KT', 'LU', 'MV', 'NW', 'OX', 'PY',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// clientId → ConnectedUser
const clients = new Map<string, ConnectedUser>();

export function addClient(clientId: string): ConnectedUser {
  const user: ConnectedUser = {
    clientId,
    initials: generateInitials(),
    color: nextColor(),
    connectedAt: new Date().toISOString(),
  };
  clients.set(clientId, user);
  return user;
}

export function removeClient(clientId: string): void {
  clients.delete(clientId);
}

export function getPresence(): ConnectedUser[] {
  return Array.from(clients.values());
}

export function getClientCount(): number {
  return clients.size;
}
