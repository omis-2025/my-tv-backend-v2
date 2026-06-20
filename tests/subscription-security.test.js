/**
 * Regression test for the critical subscription-bypass vulnerability.
 *
 * The /subscriptions/subscribe endpoint activates a subscription WITHOUT
 * payment. It must therefore reject any paid plan (price > 0) and only
 * activate free plans. Paid plans must go through Stripe checkout + webhook.
 */

// --- Mock the Prisma layer so no DB is required ---
const mockPrisma = {
  package: { findUnique: jest.fn() },
  subscription: { updateMany: jest.fn(), create: jest.fn() },
};
jest.mock('../src/config/database', () => ({ prisma: mockPrisma }));
jest.mock('../src/utils/logger', () => ({ logger: { error: jest.fn(), info: jest.fn() } }));

const subsController = require('../src/controllers/subscriptions.controller');

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

const run = (handler, req, res) =>
  Promise.resolve(handler(req, res, (err) => { if (err) throw err; }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /subscriptions/subscribe — payment bypass protection', () => {
  test('REJECTS a paid plan with 402 and does NOT create a subscription', async () => {
    mockPrisma.package.findUnique.mockResolvedValue({
      id: 'pkg-premium', name: 'Premium', price: 14.99, durationDays: 30, isActive: true,
    });
    const req = { body: { packageId: 'pkg-premium' }, user: { id: 'user-1' } };
    const res = mockRes();

    await run(subsController.subscribe, req, res);

    expect(res.statusCode).toBe(402);
    expect(res.body.success).toBe(false);
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled();
  });

  test('ALLOWS a free plan and creates an ACTIVE subscription', async () => {
    mockPrisma.package.findUnique.mockResolvedValue({
      id: 'pkg-free', name: 'Free', price: 0, durationDays: 36500, isActive: true,
    });
    mockPrisma.subscription.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.subscription.create.mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' });
    const req = { body: { packageId: 'pkg-free' }, user: { id: 'user-1' } };
    const res = mockRes();

    await run(subsController.subscribe, req, res);

    expect(res.statusCode).toBe(201);
    expect(mockPrisma.subscription.create).toHaveBeenCalledTimes(1);
    const createArg = mockPrisma.subscription.create.mock.calls[0][0];
    expect(createArg.data.status).toBe('ACTIVE');
    expect(createArg.data.packageId).toBe('pkg-free');
  });

  test('REJECTS an unknown / inactive package with 404', async () => {
    mockPrisma.package.findUnique.mockResolvedValue(null);
    const req = { body: { packageId: 'nope' }, user: { id: 'user-1' } };
    const res = mockRes();

    await run(subsController.subscribe, req, res);

    expect(res.statusCode).toBe(404);
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled();
  });
});
