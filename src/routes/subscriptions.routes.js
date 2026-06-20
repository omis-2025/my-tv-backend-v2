const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const subsController = require('../controllers/subscriptions.controller');

router.use(authenticate);

router.get('/my', subsController.getMySubscription);

router.post('/subscribe',
  [body('packageId').trim().notEmpty().withMessage('packageId is required')],
  validate,
  subsController.subscribe
);

router.post('/cancel', subsController.cancel);

// Admin
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), subsController.listAll);

router.post('/assign',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('userId').trim().notEmpty().withMessage('userId is required'),
    body('packageId').trim().notEmpty().withMessage('packageId is required'),
    body('expiresAt').isISO8601().withMessage('expiresAt must be a valid date'),
  ],
  validate,
  subsController.assignToUser
);

router.put('/:id',
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('status').optional().isIn(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']).withMessage('Invalid status'),
    body('expiresAt').optional().isISO8601().withMessage('expiresAt must be a valid date'),
  ],
  validate,
  subsController.updateSubscription
);

router.delete('/:id', authorize('SUPER_ADMIN'), subsController.deleteSubscription);

module.exports = router;
