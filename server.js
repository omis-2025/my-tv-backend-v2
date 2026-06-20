require('dotenv').config();
const app = require('./src/app');
const { logger } = require('./src/utils/logger');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  app.listen(PORT, () => {
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
