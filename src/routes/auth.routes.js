const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../utils/validators');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
  ],
  validate,
  authController.register
);

router.post('/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
