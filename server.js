require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const { connectDB } = require('./src/config/database');

const PORT = parseInt(process.env.PORT) || 5000;

if (!process.env.DATABASE_URL) {
  logger.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}

async function bootstrap() {
  await connectDB();
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
