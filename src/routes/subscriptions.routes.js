const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const subsController = require('../controllers/subscriptions.controller');

router.use(authenticate);

router.get('/my', subsController.getMySubscription);
router.post('/subscribe', subsController.subscribe);
router.post('/cancel', subsController.cancel);

// Admin
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), subsController.listAll);
router.post('/assign', authorize('ADMIN', 'SUPER_ADMIN'), subsController.assignToUser);
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN'), subsController.updateSubscription);
router.delete('/:id', authorize('SUPER_ADMIN'), subsController.deleteSubscription);

module.exports = router;
