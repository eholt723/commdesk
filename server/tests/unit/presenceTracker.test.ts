// presenceTracker holds module-level state, so we reload it between tests
// to guarantee a clean slate for each case.

describe('presenceTracker', () => {
  let tracker: typeof import('../../src/presenceTracker');

  beforeEach(async () => {
    jest.resetModules();
    tracker = await import('../../src/presenceTracker');
  });

  test('addClient returns a ConnectedUser with expected shape', () => {
    const user = tracker.addClient('client-1');
    expect(user.clientId).toBe('client-1');
    expect(typeof user.initials).toBe('string');
    expect(user.initials.length).toBeGreaterThan(0);
    expect(typeof user.color).toBe('string');
    expect(user.color.startsWith('#')).toBe(true);
    expect(typeof user.connectedAt).toBe('string');
  });

  test('addClient increases client count', () => {
    expect(tracker.getClientCount()).toBe(0);
    tracker.addClient('c1');
    expect(tracker.getClientCount()).toBe(1);
    tracker.addClient('c2');
    expect(tracker.getClientCount()).toBe(2);
  });

  test('removeClient decreases client count', () => {
    tracker.addClient('c1');
    tracker.addClient('c2');
    tracker.removeClient('c1');
    expect(tracker.getClientCount()).toBe(1);
  });

  test('getPresence returns all connected users', () => {
    tracker.addClient('c1');
    tracker.addClient('c2');
    const presence = tracker.getPresence();
    expect(presence).toHaveLength(2);
    expect(presence.map((u) => u.clientId)).toEqual(expect.arrayContaining(['c1', 'c2']));
  });

  test('removeClient removes the correct user from presence', () => {
    tracker.addClient('c1');
    tracker.addClient('c2');
    tracker.removeClient('c1');
    const presence = tracker.getPresence();
    expect(presence).toHaveLength(1);
    expect(presence[0].clientId).toBe('c2');
  });

  test('getPresence returns empty array when no clients connected', () => {
    expect(tracker.getPresence()).toEqual([]);
  });
});
