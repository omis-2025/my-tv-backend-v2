/**
 * Regression tests for Stripe webhook idempotency & duplicate-subscription
 * protection. Ensures checkout.session.completed is processed exactly once.
 */

const mockPrisma = {
  webhookEvent: { create: jest.fn(), delete: jest.fn() },
  package: { findUnique: jest.fn() },
  subscription: { updateMany: jest.fn(), upsert: jest.fn() },
  $transaction: jest.fn((ops) => Promise.all(ops)),
};
const mockStripe = {
  webhooks: { constructEvent: jest.fn() },
  customers: { create: jest.fn() },
};

jest.mock('../src/config/database', () => ({ prisma: mockPrisma }));
jest.mock('../src/utils/logger', () => ({ logger: { error: jest.fn(), info: jest.fn() } }));
jest.mock('../src/utils/stripe', () => mockStripe);

const payments = require('../src/controllers/payments.controller');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; },
  };
}

const checkoutEvent = {
  id: 'evt_123',
  type: 'checkout.session.completed',
  data: { object: { metadata: { userId: 'u1', packageId: 'pkg-premium' }, subscription: 'sub_abc' } },
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  mockStripe.webhooks.constructEvent.mockReturnValue(checkoutEvent);
  mockPrisma.package.findUnique.mockResolvedValue({ id: 'pkg-premium', name: 'Premium', price: 14.99, durationDays: 30, stripePriceId: 'price_x' });
  mockPrisma.webhookEvent.delete.mockResolvedValue({});
  mockPrisma.$transaction.mockImplementation((ops) => Promise.all(ops));
});

describe('Stripe webhook idempotency', () => {
  test('processes a NEW event once and activates subscription via upsert', async () => {
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'evt_123' });
    const req = { headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') };
    const res = mockRes();

    await payments.handleWebhook(req, res);

    expect(mockPrisma.webhookEvent.create).toHaveBeenCalledWith({ data: { id: 'evt_123', type: 'checkout.session.completed' } });
    expect(mockPrisma.subscription.upsert).toHaveBeenCalledTimes(1);
    const upsertArg = mockPrisma.subscription.upsert.mock.calls[0][0];
    expect(upsertArg.where).toEqual({ stripeSubscriptionId: 'sub_abc' });
    expect(res.body.received).toBe(true);
  });

  test('SKIPS a duplicate event (P2002) without creating a subscription', async () => {
    mockPrisma.webhookEvent.create.mockRejectedValue({ code: 'P2002' });
    const req = { headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') };
    const res = mockRes();

    await payments.handleWebhook(req, res);

    expect(mockPrisma.subscription.upsert).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.duplicate).toBe(true);
  });

  test('rejects an invalid signature with 400', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => { throw new Error('bad sig'); });
    const req = { headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') };
    const res = mockRes();

    await payments.handleWebhook(req, res);

    expect(res.statusCode).toBe(400);
    expect(mockPrisma.webhookEvent.create).not.toHaveBeenCalled();
  });

  test('removes idempotency marker and returns 500 if processing throws', async () => {
    mockPrisma.webhookEvent.create.mockResolvedValue({ id: 'evt_123' });
    mockPrisma.$transaction.mockRejectedValue(new Error('db down'));
    const req = { headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') };
    const res = mockRes();

    await payments.handleWebhook(req, res);

    expect(mockPrisma.webhookEvent.delete).toHaveBeenCalledWith({ where: { id: 'evt_123' } });
    expect(res.statusCode).toBe(500);
  });
});
