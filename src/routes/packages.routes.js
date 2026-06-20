const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const packagesController = require('../controllers/packages.controller');

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('durationDays').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('maxStreams').optional().isInt({ min: 1 }),
  body('features').optional().isArray(),
  body('isActive').optional().isBoolean(),
  body('stripePriceId').optional({ nullable: true }).isString(),
];

const updateRules = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('durationDays').optional().isInt({ min: 1 }),
  body('maxStreams').optional().isInt({ min: 1 }),
  body('features').optional().isArray(),
  body('isActive').optional().isBoolean(),
  body('stripePriceId').optional({ nullable: true }).isString(),
];

router.get('/', optionalAuth, packagesController.listPackages);
router.get('/:id', optionalAuth, packagesController.getPackage);

router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createRules, validate, packagesController.createPackage);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateRules, validate, packagesController.updatePackage);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), packagesController.deletePackage);

module.exports = router;
