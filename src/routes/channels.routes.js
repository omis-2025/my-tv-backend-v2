const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const channelsController = require('../controllers/channels.controller');

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('country').optional().isString(),
  body('language').optional().isString(),
  body('logo').optional().isString(),
  body('description').optional().isString(),
  body('isPremium').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
  body('tags').optional().isArray(),
];

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('country').optional().isString(),
  body('language').optional().isString(),
  body('logo').optional().isString(),
  body('description').optional().isString(),
  body('isPremium').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
  body('tags').optional().isArray(),
];

const bulkRules = [
  body('channels').isArray({ min: 1 }).withMessage('channels must be a non-empty array'),
  body('channels.*.name').trim().notEmpty(),
  body('channels.*.category').trim().notEmpty(),
];

// Public
router.get('/', optionalAuth, channelsController.listChannels);
router.get('/categories', channelsController.getCategories);

// Admin only (must be before /:id to avoid route conflicts)
router.post('/bulk-import', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), bulkRules, validate, channelsController.bulkImport);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createRules, validate, channelsController.createChannel);

router.get('/:id', optionalAuth, channelsController.getChannel);
router.get('/:id/stream', authenticate, channelsController.getStreamUrl);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateRules, validate, channelsController.updateChannel);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), channelsController.deleteChannel);

module.exports = router;
