import { v4 as uuidv4 } from 'uuid';
import { EventType, EventStatus, OperationEvent } from './types';
import { persistEvent, sql } from './db';
import { broadcast } from './broadcastManager';

const EVENT_TYPES: EventType[] = [
  'order_received',
  'payment_processed',
  'support_ticket_opened',
  'shipment_dispatched',
  'refund_initiated',
];

const STATUS_WEIGHTS: { status: EventStatus; weight: number }[] = [
  { status: 'success', weight: 0.8 },
  { status: 'processing', weight: 0.2 },
];

function randomStatus(): EventStatus {
  const roll = Math.random();
  let cumulative = 0;
  for (const { status, weight } of STATUS_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return status;
  }
  return 'success';
}

function buildPayload(type: EventType): Record<string, unknown> {
  switch (type) {
    case 'order_received':
      return { orderId: `ORD-${Math.floor(Math.random() * 90000) + 10000}`, amount: +(Math.random() * 500).toFixed(2) };
    case 'payment_processed':
      return { txId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`, currency: 'USD' };
    case 'support_ticket_opened':
      return { ticketId: `TKT-${Math.floor(Math.random() * 9000) + 1000}`, priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] };
    case 'shipment_dispatched':
      return { trackingNumber: `SHP-${uuidv4().slice(0, 10).toUpperCase()}`, carrier: 'FedEx' };
    case 'refund_initiated':
      return { refundId: `RFD-${Math.floor(Math.random() * 90000) + 10000}`, amount: +(Math.random() * 200).toFixed(2) };
  }
}

// Running totals for health stats
let eventsProcessed = 0;
let errorCount = 0;

export function getHealthStats() {
  return {
    eventsProcessed,
    activeConnections: 0, // injected by wsServer
    errorRate: eventsProcessed === 0 ? 0 : +(errorCount / eventsProcessed).toFixed(3),
  };
}

export function incrementConnections(_delta: number): void {
  // placeholder — health panel gets activeConnections from broadcastManager
}

const RESOLVE_DELAY_MS = 4000; // how long a processing event stays pending

function scheduleResolution(eventId: string): void {
  setTimeout(async () => {
    try {
      await sql`UPDATE events SET status = 'success' WHERE id = ${eventId}`;
      broadcast({ type: 'event_update', id: eventId, status: 'success' });
    } catch {
      errorCount++;
      broadcast({ type: 'event_update', id: eventId, status: 'error' });
    }
  }, RESOLVE_DELAY_MS);
}

export async function fireEvent(requestedType?: EventType): Promise<OperationEvent> {
  const type = requestedType ?? EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const status = randomStatus();

  const event: OperationEvent = {
    id: uuidv4(),
    type,
    status,
    payload: buildPayload(type),
    timestamp: new Date().toISOString(),
  };

  eventsProcessed++;

  try {
    await persistEvent(event);
  } catch {
    errorCount++;
    event.status = 'error';
    broadcast({ type: 'event', event });
    return event;
  }

  broadcast({ type: 'event', event });

  if (status === 'processing') scheduleResolution(event.id);

  return event;
}
