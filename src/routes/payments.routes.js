const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const paymentsController = require('../controllers/payments.controller');

// Stripe webhook — raw body required, no auth
router.post('/webhook', paymentsController.handleWebhook);

// Authenticated payment routes
router.post('/checkout', authenticate, paymentsController.createCheckoutSession);
router.post('/portal', authenticate, paymentsController.createPortalSession);

module.exports = router;
