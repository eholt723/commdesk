// Mirror of server/src/types.ts — keep in sync manually or extract to a shared package later

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
  timestamp: string;
}

export interface ConnectedUser {
  clientId: string;
  initials: string;
  color: string;
  connectedAt: string;
}

export interface HealthStats {
  eventsProcessed: number;
  totalEvents: number;
  activeConnections: number;
  errorRate: number;
}

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
