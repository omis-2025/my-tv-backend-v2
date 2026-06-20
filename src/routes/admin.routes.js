const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivityLog);

module.exports = router;
