import { WebSocket } from 'ws';

// --- Event types ---

export type EventStatus = 'success' | 'error' | 'processing';

export type EventType =
  | 'order_received'
  | 'payment_processed'
  | 'support_ticket_opened'
  | 'shipment_dispatched'
  | 'refund_initiated';

export interface OperationEvent {
  id: string;
  type: EventType;
  status: EventStatus;
  payload: Record<string, unknown>;
  timestamp: string; // ISO 8601
}

// --- Presence types ---

export interface ConnectedUser {
  clientId: string;
  initials: string;
  color: string;
  connectedAt: string; // ISO 8601
}

// --- WebSocket message payloads ---

export type ServerMessageType =
  | 'init'
  | 'event'
  | 'event_update'
  | 'presence_update'
  | 'health_update';

export interface InitMessage {
  type: 'init';
  events: OperationEvent[];
  presence: ConnectedUser[];
  health: HealthStats;
}

export interface EventMessage {
  type: 'event';
  event: OperationEvent;
}

export interface PresenceUpdateMessage {
  type: 'presence_update';
  presence: ConnectedUser[];
}

export interface HealthUpdateMessage {
  type: 'health_update';
  health: HealthStats;
}

export interface EventUpdateMessage {
  type: 'event_update';
  id: string;
  status: Exclude<EventStatus, 'processing'>;
}

export type ServerMessage =
  | InitMessage
  | EventMessage
  | EventUpdateMessage
  | PresenceUpdateMessage
  | HealthUpdateMessage;

// --- Client → server messages ---

export type ClientMessageType = 'fire_event';

export interface FireEventMessage {
  type: 'fire_event';
  eventType?: EventType;
}

export type ClientMessage = FireEventMessage;

// --- Health stats ---

export interface HealthStats {
  eventsProcessed: number;
  activeConnections: number;
  errorRate: number; // 0–1
}

// --- Internal client record ---

export interface ClientRecord {
  ws: WebSocket;
  user: ConnectedUser;
}
