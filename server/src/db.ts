import { neon } from '@neondatabase/serverless';
import { OperationEvent } from './types';

export const sql = neon(process.env.DATABASE_URL!);

export async function initSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL,
      status      TEXT NOT NULL,
      payload     JSONB NOT NULL DEFAULT '{}',
      timestamp   TIMESTAMPTZ NOT NULL
    )
  `;
}

export async function persistEvent(event: OperationEvent): Promise<void> {
  await sql`
    INSERT INTO events (id, type, status, payload, timestamp)
    VALUES (
      ${event.id},
      ${event.type},
      ${event.status},
      ${JSON.stringify(event.payload)},
      ${event.timestamp}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function getRecentEvents(limit = 50): Promise<OperationEvent[]> {
  const rows = await sql`
    SELECT id, type, status, payload, timestamp
    FROM events
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;

  return rows
    .map((row) => ({
      id: row.id as string,
      type: row.type as OperationEvent['type'],
      status: row.status as OperationEvent['status'],
      payload: row.payload as Record<string, unknown>,
      timestamp: (row.timestamp as Date).toISOString(),
    }))
    .reverse(); // chronological order for the client
}
