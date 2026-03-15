const router = require('express').Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markRead);
router.put('/read-all', protect, markAllRead);

module.exports = router;
