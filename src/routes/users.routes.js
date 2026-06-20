const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.put('/change-password', usersController.changePassword);
router.get('/subscription', usersController.getMySubscription);
router.get('/watchlist', usersController.getWatchlist);
router.post('/watchlist/:channelId', usersController.addToWatchlist);
router.delete('/watchlist/:channelId', usersController.removeFromWatchlist);

// Admin only
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), usersController.listUsers);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN'), usersController.getUserById);
router.put('/:id/status', authorize('ADMIN', 'SUPER_ADMIN'), usersController.toggleUserStatus);
router.delete('/:id', authorize('SUPER_ADMIN'), usersController.deleteUser);

module.exports = router;
