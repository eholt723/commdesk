import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  ServerMessage,
  OperationEvent,
  ConnectedUser,
  HealthStats,
} from '../types';

const WS_URL =
  import.meta.env.VITE_WS_URL ??
  (window.location.protocol === 'https:'
    ? `wss://${window.location.host}/ws`
    : `ws://${window.location.host}/ws`);

const MAX_EVENTS = 50;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface DashboardState {
  events: OperationEvent[];
  presence: ConnectedUser[];
  health: HealthStats;
  status: ConnectionStatus;
  fireEvent: () => void;
}

export function useWebSocket(): DashboardState {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [events, setEvents] = useState<OperationEvent[]>([]);
  const [presence, setPresence] = useState<ConnectedUser[]>([]);
  const [health, setHealth] = useState<HealthStats>({
    eventsProcessed: 0,
    totalEvents: 0,
    activeConnections: 0,
    errorRate: 0,
  });
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => setStatus('connected');

    ws.onmessage = (e: MessageEvent<string>) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(e.data) as ServerMessage;
      } catch {
        return;
      }

      switch (msg.type) {
        case 'init':
          setEvents(msg.events.slice(-MAX_EVENTS));
          setPresence(msg.presence);
          setHealth(msg.health);
          break;

        case 'event':
          setEvents((prev) => {
            const next = [...prev, msg.event];
            return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
          });
          break;

        case 'event_update':
          setEvents((prev) =>
            prev.map((e) => (e.id === msg.id ? { ...e, status: msg.status } : e))
          );
          break;

        case 'presence_update':
          setPresence(msg.presence);
          break;

        case 'health_update':
          setHealth(msg.health);
          break;
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const fireEvent = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'fire_event' }));
    }
  }, []);

  return { events, presence, health, status, fireEvent };
}
