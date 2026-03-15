const router = require('express').Router();
const { getAnalytics } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'supervisor'), getAnalytics);

module.exports = router;
