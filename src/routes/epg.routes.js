const router = require('express').Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const epgController = require('../controllers/epg.controller');

router.get('/', optionalAuth, epgController.getEPG);
router.get('/channel/:channelId', optionalAuth, epgController.getChannelEPG);
router.get('/now-playing', optionalAuth, epgController.getNowPlaying);

// Admin
router.post('/sync', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), epgController.syncEPG);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), epgController.createEntry);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), epgController.updateEntry);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), epgController.deleteEntry);

module.exports = router;
