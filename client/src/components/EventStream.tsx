import { useEffect, useRef, useState } from 'react';
import type { OperationEvent, EventStatus } from '../types';

const FLASH_DURATION_MS = 2000;

const STATUS_COLORS: Record<EventStatus, string> = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  processing: 'text-yellow-400',
};

const FLASH_BG: Record<EventStatus, string> = {
  success: 'bg-emerald-100 dark:bg-emerald-900/40',
  error: 'bg-red-100 dark:bg-red-900/40',
  processing: 'bg-yellow-100 dark:bg-yellow-900/40',
};

const EVENT_LABELS: Record<string, string> = {
  order_received: 'Order Received',
  payment_processed: 'Payment Processed',
  support_ticket_opened: 'Support Ticket Opened',
  shipment_dispatched: 'Shipment Dispatched',
  refund_initiated: 'Refund Initiated',
};

interface Props {
  events: OperationEvent[];
}

export function EventStream({ events }: Props) {
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const newEvents = events.slice(prevCountRef.current);
    prevCountRef.current = events.length;

    if (newEvents.length === 0) return;

    const newIds = new Set(newEvents.map((e) => e.id));
    setFlashIds((prev) => new Set([...prev, ...newIds]));

    const timer = setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.delete(id));
        return next;
      });
    }, FLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [events]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-[480px] pr-1">
      {events.length === 0 && (
        <p className="text-slate-400 dark:text-slate-500 text-sm py-4 text-center">
          No events yet. Fire one to get started.
        </p>
      )}
      {events.map((event) => {
        const flashing = flashIds.has(event.id);
        return (
          <div
            key={event.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${
              flashing ? FLASH_BG[event.status] : 'bg-slate-100 dark:bg-slate-800/50'
            }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                event.status === 'success'
                  ? 'bg-emerald-400'
                  : event.status === 'error'
                  ? 'bg-red-400'
                  : 'bg-yellow-400'
              }`}
            />
            <span className="text-slate-700 dark:text-slate-300 flex-1 truncate">
              {EVENT_LABELS[event.type] ?? event.type}
            </span>
            <span className={`font-medium ${STATUS_COLORS[event.status]}`}>
              {event.status}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs flex-shrink-0">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
