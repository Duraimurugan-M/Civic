const router = require('express').Router();
const { submitFeedback, getFeedback } = require('../controllers/feedback.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/:id', protect, authorize('citizen'), submitFeedback);
router.get('/:id', protect, getFeedback);

module.exports = router;
