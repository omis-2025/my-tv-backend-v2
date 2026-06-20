const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/channels', require('./channels.routes'));
router.use('/streams', require('./streams.routes'));
router.use('/subscriptions', require('./subscriptions.routes'));
router.use('/epg', require('./epg.routes'));
router.use('/packages', require('./packages.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/payments', require('./payments.routes'));

module.exports = router;
