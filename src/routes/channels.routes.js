const router = require('express').Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const channelsController = require('../controllers/channels.controller');

// Public
router.get('/', optionalAuth, channelsController.listChannels);
router.get('/categories', channelsController.getCategories);

// Admin only (must be before /:id to avoid route conflicts)
router.post('/bulk-import', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.bulkImport);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.createChannel);

router.get('/:id', optionalAuth, channelsController.getChannel);
router.get('/:id/stream', authenticate, channelsController.getStreamUrl);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.updateChannel);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.deleteChannel);

module.exports = router;
