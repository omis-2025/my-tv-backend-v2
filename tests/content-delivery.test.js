/**
 * Tests for the launch-critical content delivery layer:
 *  - M3U playlist generation + premium gating (playlist controller)
 *  - CSV stream import parsing + channel matching (streams controller)
 */

const mockPrisma = {
  subscription: { findFirst: jest.fn() },
  channel: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
  user: { findUnique: jest.fn(), update: jest.fn() },
  stream: { create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
};
jest.mock('../src/config/database', () => ({ prisma: mockPrisma }));
jest.mock('../src/utils/logger', () => ({ logger: { error: jest.fn(), info: jest.fn() } }));

const playlist = require('../src/controllers/playlist.controller');
const streams = require('../src/controllers/streams.controller');

function mockRes() {
  return {
    statusCode: null, body: null, headers: {}, sent: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    setHeader(k, v) { this.headers[k] = v; },
    send(payload) { this.sent = payload; return this; },
  };
}
const run = (handler, req, res) => Promise.resolve(handler(req, res, (err) => { if (err) throw err; }));

beforeEach(() => jest.clearAllMocks());

describe('M3U playlist generation', () => {
  test('builds valid M3U and gates premium channels behind an active sub', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', isActive: true });
    // No active subscription -> only free channels should be queried/returned.
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.channel.findMany.mockResolvedValue([
      { id: 'c1', name: 'Free News', category: 'News', logo: null, streams: [{ url: 'https://cdn/news.m3u8' }] },
    ]);

    const req = { query: { token: 'tok' }, protocol: 'https', get: () => 'host' };
    const res = mockRes();
    await run(playlist.getPlaylist, req, res);

    expect(res.headers['Content-Type']).toContain('mpegurl');
    expect(res.sent).toContain('#EXTM3U');
    expect(res.sent).toContain('https://cdn/news.m3u8');
    expect(res.sent).toContain('group-title="News"');
    // The findMany query must exclude premium channels when no sub.
    const whereArg = mockPrisma.channel.findMany.mock.calls[0][0].where;
    expect(whereArg.isPremium).toBe(false);
  });

  test('rejects a missing/invalid token with 401', async () => {
    const req = { query: {}, protocol: 'https', get: () => 'host' };
    const res = mockRes();
    await run(playlist.getPlaylist, req, res);
    expect(res.statusCode).toBe(401);

    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req2 = { query: { token: 'bad' }, protocol: 'https', get: () => 'host' };
    const res2 = mockRes();
    await run(playlist.getPlaylist, req2, res2);
    expect(res2.statusCode).toBe(401);
  });

  test('active subscription includes premium channels in the query', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', isActive: true });
    mockPrisma.subscription.findFirst.mockResolvedValue({ id: 's1', status: 'ACTIVE' });
    mockPrisma.channel.findMany.mockResolvedValue([]);
    const req = { query: { token: 'tok' }, protocol: 'https', get: () => 'host' };
    const res = mockRes();
    await run(playlist.getPlaylist, req, res);
    const whereArg = mockPrisma.channel.findMany.mock.calls[0][0].where;
    expect(whereArg.isPremium).toBeUndefined();
  });
});

describe('CSV stream import', () => {
  test('imports rows, matching channels by name, and reports errors', async () => {
    mockPrisma.channel.findFirst.mockImplementation(({ where }) =>
      where.name.equals === 'BBC One'
        ? Promise.resolve({ id: 'chan-bbc', name: 'BBC One' })
        : Promise.resolve(null));
    mockPrisma.stream.create.mockResolvedValue({ id: 'str-1' });

    const csv = [
      'channelName,url,streamType,priority',
      'BBC One,https://cdn/bbc.m3u8,HLS,0',
      'Unknown Channel,https://cdn/x.m3u8,HLS,0',
      'BBC One,,HLS,0',
    ].join('\n');

    const req = { body: { csv } };
    const res = mockRes();
    await run(streams.importCsv, req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.created).toBe(1);
    expect(res.body.data.failed).toBe(2); // unknown channel + missing url
    expect(mockPrisma.stream.create).toHaveBeenCalledTimes(1);
  });

  test('rejects empty csv with 400', async () => {
    const req = { body: { csv: '' } };
    const res = mockRes();
    await run(streams.importCsv, req, res);
    expect(res.statusCode).toBe(400);
  });
});
