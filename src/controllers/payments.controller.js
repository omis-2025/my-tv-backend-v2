const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { success, error } = require('../utils/response');

function getStripe() {
  const stripe = require('../utils/stripe');
  if (!stripe) throw Object.assign(new Error('Stripe is not configured on this server'), { statusCode: 503 });
  return stripe;
}

async function getOrCreateCustomer(user) {
  const stripe = getStripe();
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({ email: user.email, name: user.name });
  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const { packageId } = req.body;
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) return error(res, 'Package not found', 404);
  if (!pkg.stripePriceId) return error(res, 'Package not configured for payments', 400);

  const customerId = await getOrCreateCustomer(req.user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${frontendUrl}/dashboard?payment=success`,
    cancel_url: `${frontendUrl}/subscribe?payment=cancelled`,
    metadata: { userId: req.user.id, packageId },
  });

  success(res, { url: session.url, sessionId: session.id });
});

exports.createPortalSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!req.user.stripeCustomerId) return error(res, 'No billing account found', 404);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: req.user.stripeCustomerId,
    return_url: `${frontendUrl}/dashboard`,
  });

  success(res, { url: session.url });
});

exports.handleWebhook = async (req, res) => {
  let stripe;
  try { stripe = getStripe(); } catch {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // IDEMPOTENCY: record the Stripe event id before processing. If it already
  // exists, this is a duplicate delivery (Stripe retries) — acknowledge and skip
  // so each event (esp. checkout.session.completed) is processed exactly once.
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch (err) {
    if (err.code === 'P2002') {
      // Already processed — return 200 so Stripe stops retrying.
      return res.json({ received: true, duplicate: true });
    }
    console.error('Webhook idempotency check failed:', err);
    // Let Stripe retry later.
    return res.status(500).json({ error: 'Idempotency store unavailable' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, packageId } = session.metadata || {};
        if (!userId || !packageId) break;
        const pkg = await prisma.package.findUnique({ where: { id: packageId } });
        if (!pkg) break;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

        // Single active subscription per user + dedupe by Stripe subscription id.
        // Wrapped in a transaction so cancel-old + activate-new are atomic.
        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'CANCELLED' },
          }),
          prisma.subscription.upsert({
            where: { stripeSubscriptionId: session.subscription },
            update: { userId, packageId, status: 'ACTIVE', expiresAt, stripePriceId: pkg.stripePriceId },
            create: { userId, packageId, status: 'ACTIVE', expiresAt, stripeSubscriptionId: session.subscription, stripePriceId: pkg.stripePriceId },
          }),
        ]);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId: sub.id }, data: { status: 'CANCELLED' } });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await prisma.subscription.updateMany({ where: { stripeSubscriptionId: invoice.subscription }, data: { status: 'EXPIRED' } });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const status = sub.status === 'active' ? 'ACTIVE' : sub.status === 'canceled' ? 'CANCELLED' : 'EXPIRED';
        const expiresAt = new Date(sub.current_period_end * 1000);
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId: sub.id }, data: { status, expiresAt } });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Processing failed AFTER we recorded the event id. Remove the marker so
    // Stripe's retry can reprocess it, and signal failure.
    await prisma.webhookEvent.delete({ where: { id: event.id } }).catch(() => {});
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  res.json({ received: true });
};
