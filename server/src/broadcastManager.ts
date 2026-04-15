import { WebSocket } from 'ws';
import { ServerMessage } from './types';

// clientId → WebSocket
const connections = new Map<string, WebSocket>();

export function registerConnection(clientId: string, ws: WebSocket): void {
  connections.set(clientId, ws);
}

export function removeConnection(clientId: string): void {
  connections.delete(clientId);
}

export function broadcast(message: ServerMessage): void {
  const payload = JSON.stringify(message);
  for (const ws of connections.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

export function sendTo(clientId: string, message: ServerMessage): void {
  const ws = connections.get(clientId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function getConnectionCount(): number {
  return connections.size;
}
