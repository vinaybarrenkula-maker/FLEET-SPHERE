const express = require('express');
const router = express.Router();
const c = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', c.getNotifications);
router.get('/unread-count', c.getUnreadCount);
router.patch('/:id/read', c.markAsRead);
router.patch('/read-all', c.markAllAsRead);

module.exports = router;
