// Integration tests — require a live DATABASE_URL.
// Skipped automatically in CI unless the secret is available.
// Run locally: DATABASE_URL=your-neon-url npm run test:integration

import { v4 as uuidv4 } from 'uuid';
import type { OperationEvent } from '../../src/types';

const runIntegration = process.env.DATABASE_URL ? describe : describe.skip;

runIntegration('db integration', () => {
  let db: typeof import('../../src/db');

  beforeAll(async () => {
    db = await import('../../src/db');
    await db.initSchema(); // ensure table exists
  });

  function makeEvent(overrides: Partial<OperationEvent> = {}): OperationEvent {
    return {
      id: uuidv4(),
      type: 'order_received',
      status: 'success',
      payload: { orderId: 'ORD-99999', amount: 42.0 },
      timestamp: new Date().toISOString(),
      ...overrides,
    };
  }

  test('persistEvent stores an event retrievable by getRecentEvents', async () => {
    const event = makeEvent();
    await db.persistEvent(event);

    const events = await db.getRecentEvents(50);
    const found = events.find((e) => e.id === event.id);

    expect(found).toBeDefined();
    expect(found?.type).toBe('order_received');
    expect(found?.status).toBe('success');
  });

  test('getRecentEvents returns events in chronological order', async () => {
    const events = await db.getRecentEvents(50);
    for (let i = 1; i < events.length; i++) {
      const prev = new Date(events[i - 1].timestamp).getTime();
      const curr = new Date(events[i].timestamp).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  test('getRecentEvents respects the limit', async () => {
    const events = await db.getRecentEvents(3);
    expect(events.length).toBeLessThanOrEqual(3);
  });

  test('persistEvent with duplicate id is a no-op (ON CONFLICT DO NOTHING)', async () => {
    const event = makeEvent();
    await db.persistEvent(event);
    await expect(db.persistEvent(event)).resolves.not.toThrow();

    // Only one copy should exist
    const events = await db.getRecentEvents(100);
    const matches = events.filter((e) => e.id === event.id);
    expect(matches).toHaveLength(1);
  });

  test('payload round-trips through JSON correctly', async () => {
    const payload = { orderId: 'ORD-55555', amount: 123.45, nested: { flag: true } };
    const event = makeEvent({ payload });
    await db.persistEvent(event);

    const events = await db.getRecentEvents(50);
    const found = events.find((e) => e.id === event.id);
    expect(found?.payload).toEqual(payload);
  });
});
