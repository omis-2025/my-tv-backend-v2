const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { globalRateLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(globalRateLimiter);

// Health check — must be before rate limiter and other middleware
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/', (_, res) => res.json({ status: 'ok', service: 'MyTV Backend API', version: '2.0.0' }));

// API routes
app.use('/api/v1', routes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
