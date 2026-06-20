const router = require('express').Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const packagesController = require('../controllers/packages.controller');

router.get('/', optionalAuth, packagesController.listPackages);
router.get('/:id', optionalAuth, packagesController.getPackage);

router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), packagesController.createPackage);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), packagesController.updatePackage);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), packagesController.deletePackage);

module.exports = router;
