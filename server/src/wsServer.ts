import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { addClient, removeClient, getPresence } from './presenceTracker';
import { registerConnection, removeConnection, broadcast, sendTo, getConnectionCount } from './broadcastManager';
import { fireEvent, getHealthStats } from './eventHandler';
import { getRecentEvents } from './db';
import { ClientMessage, EventType } from './types';

function isValidEventType(value: unknown): value is EventType {
  const valid: EventType[] = [
    'order_received',
    'payment_processed',
    'support_ticket_opened',
    'shipment_dispatched',
    'refund_initiated',
  ];
  return typeof value === 'string' && (valid as string[]).includes(value);
}

function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const msg = parsed as Record<string, unknown>;
    if (msg['type'] === 'fire_event') {
      return {
        type: 'fire_event',
        eventType: isValidEventType(msg['eventType']) ? msg['eventType'] : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function attachWebSocketServer(server: import('http').Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocket, _req: IncomingMessage) => {
    const clientId = uuidv4();
    const user = addClient(clientId);
    registerConnection(clientId, ws);

    // Send init payload: recent events + presence + health
    const [recentEvents] = await Promise.all([getRecentEvents(50)]);

    sendTo(clientId, {
      type: 'init',
      events: recentEvents,
      presence: getPresence(),
      health: {
        ...getHealthStats(),
        activeConnections: getConnectionCount(),
      },
    });

    // Broadcast updated presence to everyone else
    broadcast({
      type: 'presence_update',
      presence: getPresence(),
    });

    // Broadcast updated health
    broadcast({
      type: 'health_update',
      health: {
        ...getHealthStats(),
        activeConnections: getConnectionCount(),
      },
    });

    ws.on('message', async (data) => {
      const msg = parseClientMessage(data.toString());
      if (!msg) return;

      if (msg.type === 'fire_event') {
        await fireEvent(msg.eventType);

        broadcast({
          type: 'health_update',
          health: {
            ...getHealthStats(),
            activeConnections: getConnectionCount(),
          },
        });
      }
    });

    ws.on('close', () => {
      removeClient(clientId);
      removeConnection(clientId);

      broadcast({
        type: 'presence_update',
        presence: getPresence(),
      });

      broadcast({
        type: 'health_update',
        health: {
          ...getHealthStats(),
          activeConnections: getConnectionCount(),
        },
      });
    });

    ws.on('error', (err) => {
      console.error(`[ws] client ${clientId} error:`, err.message);
    });

    console.log(`[ws] client connected: ${clientId} (${user.initials}) — total: ${getConnectionCount()}`);
  });

  return wss;
}
