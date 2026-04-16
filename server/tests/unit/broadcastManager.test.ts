import { WebSocket } from 'ws';
import { EventMessage } from '../../src/types';

// Mock ws so we don't need a real server
jest.mock('ws', () => {
  const actual = jest.requireActual('ws') as { WebSocket: typeof WebSocket };
  return {
    ...actual,
    WebSocket: class MockWS {
      static OPEN = 1;
      readyState: number;
      sent: string[] = [];
      constructor() {
        this.readyState = MockWS.OPEN;
      }
      send(data: string): void {
        this.sent.push(data);
      }
    },
  };
});

describe('broadcastManager', () => {
  let manager: typeof import('../../src/broadcastManager');

  beforeEach(async () => {
    jest.resetModules();
    manager = await import('../../src/broadcastManager');
  });

  function makeMockWs(): WebSocket & { sent: string[] } {
    const ws = new WebSocket('') as WebSocket & { sent: string[] };
    ws.sent = [];
    return ws;
  }

  const sampleMessage: EventMessage = {
    type: 'event',
    event: {
      id: 'test-id',
      type: 'order_received',
      status: 'success',
      payload: { orderId: 'ORD-12345', amount: 99.99 },
      timestamp: new Date().toISOString(),
    },
  };

  test('registered connection receives broadcast', () => {
    const ws = makeMockWs();
    manager.registerConnection('c1', ws);
    manager.broadcast(sampleMessage);
    expect(ws.sent).toHaveLength(1);
    expect(JSON.parse(ws.sent[0])).toMatchObject({ type: 'event' });
  });

  test('broadcast reaches all registered connections', () => {
    const ws1 = makeMockWs();
    const ws2 = makeMockWs();
    manager.registerConnection('c1', ws1);
    manager.registerConnection('c2', ws2);
    manager.broadcast(sampleMessage);
    expect(ws1.sent).toHaveLength(1);
    expect(ws2.sent).toHaveLength(1);
  });

  test('removed connection does not receive broadcast', () => {
    const ws = makeMockWs();
    manager.registerConnection('c1', ws);
    manager.removeConnection('c1');
    manager.broadcast(sampleMessage);
    expect(ws.sent).toHaveLength(0);
  });

  test('sendTo delivers only to the target connection', () => {
    const ws1 = makeMockWs();
    const ws2 = makeMockWs();
    manager.registerConnection('c1', ws1);
    manager.registerConnection('c2', ws2);
    manager.sendTo('c1', sampleMessage);
    expect(ws1.sent).toHaveLength(1);
    expect(ws2.sent).toHaveLength(0);
  });

  test('getConnectionCount reflects registered clients', () => {
    expect(manager.getConnectionCount()).toBe(0);
    const ws1 = makeMockWs();
    manager.registerConnection('c1', ws1);
    expect(manager.getConnectionCount()).toBe(1);
    manager.removeConnection('c1');
    expect(manager.getConnectionCount()).toBe(0);
  });
});
