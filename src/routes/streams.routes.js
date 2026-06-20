const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { streamRateLimiter } = require('../middleware/rateLimiter');
const streamsController = require('../controllers/streams.controller');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.listStreams);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.createStream);

// Bulk admin operations (must precede /:id routes)
router.post('/import-csv', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.importCsv);
router.post('/bulk-update', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.bulkUpdate);
router.post('/health-check', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.bulkHealthCheck);

router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.updateStream);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.deleteStream);

// Stream health check
router.get('/:id/health', authorize('ADMIN', 'SUPER_ADMIN'), streamsController.checkHealth);

// Resolve a playable URL (rate limited)
router.get('/:id/play', streamRateLimiter, streamsController.resolveStream);

module.exports = router;
