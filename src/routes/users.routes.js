const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const usersController = require('../controllers/users.controller');
const playlistController = require('../controllers/playlist.controller');

router.use(authenticate);

// IPTV M3U playlist token management
router.get('/playlist-token', playlistController.getPlaylistToken);
router.post('/playlist-token/rotate', playlistController.rotatePlaylistToken);

router.get('/profile', usersController.getProfile);

router.put('/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('avatar').optional().isString(),
  ],
  validate,
  usersController.updateProfile
);

router.put('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  usersController.changePassword
);

router.get('/subscription', usersController.getMySubscription);
router.get('/watchlist', usersController.getWatchlist);
router.post('/watchlist/:channelId', usersController.addToWatchlist);
router.delete('/watchlist/:channelId', usersController.removeFromWatchlist);

// Admin only
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), usersController.listUsers);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN'), usersController.getUserById);
router.put('/:id/status',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [body('isActive').isBoolean().withMessage('isActive must be a boolean')],
  validate,
  usersController.toggleUserStatus
);
router.delete('/:id', authorize('SUPER_ADMIN'), usersController.deleteUser);

module.exports = router;
