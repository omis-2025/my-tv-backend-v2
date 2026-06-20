const router = require('express').Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const channelsController = require('../controllers/channels.controller');

// Public
router.get('/', optionalAuth, channelsController.listChannels);
router.get('/categories', channelsController.getCategories);
router.get('/:id', optionalAuth, channelsController.getChannel);

// Authenticated users
router.get('/:id/stream', authenticate, channelsController.getStreamUrl);

// Admin only
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.createChannel);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.updateChannel);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.deleteChannel);
router.post('/bulk-import', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.bulkImport);

module.exports = router;
