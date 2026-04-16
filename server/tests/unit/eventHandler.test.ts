// eventHandler holds module-level counters (eventsProcessed, errorCount).
// We reload the module before each test and swap in fresh mocks so state
// never leaks between cases.

describe('eventHandler', () => {
  let handler: typeof import('../../src/eventHandler');
  let mockPersistEvent: jest.Mock;
  let mockBroadcast: jest.Mock;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    jest.resetModules();

    mockPersistEvent = jest.fn().mockResolvedValue(undefined);
    mockBroadcast = jest.fn();

    jest.doMock('../../src/db', () => ({
      persistEvent: mockPersistEvent,
      sql: jest.fn(),
    }));

    jest.doMock('../../src/broadcastManager', () => ({
      broadcast: mockBroadcast,
    }));

    handler = await import('../../src/eventHandler');
  });

  // --- getHealthStats ---

  describe('getHealthStats', () => {
    test('returns zero stats before any events are fired', () => {
      const stats = handler.getHealthStats();
      expect(stats.eventsProcessed).toBe(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.activeConnections).toBe(0);
    });

    test('errorRate stays 0 after successful events', async () => {
      await handler.fireEvent('order_received');
      await handler.fireEvent('order_received');
      expect(handler.getHealthStats().errorRate).toBe(0);
    });

    test('errorRate reflects DB failures', async () => {
      mockPersistEvent
        .mockResolvedValueOnce(undefined) // first succeeds
        .mockRejectedValueOnce(new Error('connection timeout')); // second fails

      await handler.fireEvent('order_received');
      await handler.fireEvent('order_received');

      const stats = handler.getHealthStats();
      expect(stats.eventsProcessed).toBe(2);
      expect(stats.errorRate).toBe(0.5);
    });
  });

  // --- fireEvent ---

  describe('fireEvent', () => {
    test('increments eventsProcessed on each call', async () => {
      await handler.fireEvent();
      expect(handler.getHealthStats().eventsProcessed).toBe(1);

      await handler.fireEvent();
      expect(handler.getHealthStats().eventsProcessed).toBe(2);
    });

    test('returns event with the requested type', async () => {
      const event = await handler.fireEvent('payment_processed');
      expect(event.type).toBe('payment_processed');
    });

    test('returned event has valid shape', async () => {
      const event = await handler.fireEvent('shipment_dispatched');
      expect(typeof event.id).toBe('string');
      expect(event.id.length).toBeGreaterThan(0);
      expect(event.type).toBe('shipment_dispatched');
      expect(['success', 'processing', 'error']).toContain(event.status);
      expect(typeof event.payload).toBe('object');
      expect(typeof event.timestamp).toBe('string');
    });

    test('calls persistEvent with the generated event', async () => {
      const event = await handler.fireEvent('refund_initiated');
      expect(mockPersistEvent).toHaveBeenCalledWith(expect.objectContaining({ id: event.id }));
    });

    test('broadcasts the event after persisting', async () => {
      const event = await handler.fireEvent('support_ticket_opened');
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'event', event: expect.objectContaining({ id: event.id }) })
      );
    });
  });

  // --- DB failure path ---

  describe('fireEvent — DB failure', () => {
    beforeEach(() => {
      mockPersistEvent.mockRejectedValue(new Error('DB unreachable'));
    });

    test('returns event with status error', async () => {
      const event = await handler.fireEvent('order_received');
      expect(event.status).toBe('error');
    });

    test('increments errorCount', async () => {
      await handler.fireEvent();
      expect(handler.getHealthStats().errorRate).toBeGreaterThan(0);
    });

    test('broadcasts the error event', async () => {
      await handler.fireEvent();
      expect(mockBroadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'event',
          event: expect.objectContaining({ status: 'error' }),
        })
      );
    });
  });

  // --- payload shapes ---

  describe('event payloads', () => {
    test('order_received payload has orderId and amount', async () => {
      const event = await handler.fireEvent('order_received');
      expect(event.payload).toHaveProperty('orderId');
      expect(event.payload).toHaveProperty('amount');
    });

    test('payment_processed payload has txId and currency', async () => {
      const event = await handler.fireEvent('payment_processed');
      expect(event.payload).toHaveProperty('txId');
      expect(event.payload.currency).toBe('USD');
    });

    test('support_ticket_opened payload has ticketId and priority', async () => {
      const event = await handler.fireEvent('support_ticket_opened');
      expect(event.payload).toHaveProperty('ticketId');
      expect(['low', 'medium', 'high']).toContain(event.payload.priority);
    });

    test('shipment_dispatched payload has trackingNumber and carrier', async () => {
      const event = await handler.fireEvent('shipment_dispatched');
      expect(event.payload).toHaveProperty('trackingNumber');
      expect(event.payload.carrier).toBe('FedEx');
    });

    test('refund_initiated payload has refundId and amount', async () => {
      const event = await handler.fireEvent('refund_initiated');
      expect(event.payload).toHaveProperty('refundId');
      expect(event.payload).toHaveProperty('amount');
    });
  });
});
