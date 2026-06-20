require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const { connectDB, prisma } = require('./src/config/database');

const PORT = parseInt(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';
const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

if (!process.env.DATABASE_URL) {
  logger.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}

if (!process.env.JWT_REFRESH_SECRET) {
  logger.error('FATAL: JWT_REFRESH_SECRET is not set');
  process.exit(1);
}

// In production, if Stripe is enabled the webhook secret is mandatory —
// without it paid subscriptions can never be activated (webhook would 400).
if (isProd && stripeEnabled && !process.env.STRIPE_WEBHOOK_SECRET) {
  logger.error('FATAL: STRIPE_WEBHOOK_SECRET is required in production when Stripe is enabled');
  process.exit(1);
}

// Verify every active PAID package has a Stripe price id, otherwise checkout
// will fail at runtime. Runs after seeding (startup.sh seeds before boot).
async function validateStripePriceIds() {
  if (!(isProd && stripeEnabled)) return;
  const broken = await prisma.package.findMany({
    where: { isActive: true, price: { gt: 0 }, OR: [{ stripePriceId: null }, { stripePriceId: '' }] },
    select: { id: true, name: true },
  });
  if (broken.length) {
    logger.error(`FATAL: ${broken.length} active paid package(s) missing stripePriceId: ${broken.map(p => p.name).join(', ')}`);
    process.exit(1);
  }
}

async function bootstrap() {
  await connectDB();
  await validateStripePriceIds();
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});
