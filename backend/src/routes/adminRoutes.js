const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const { authenticate, authorizeRole } = require('../middlewares/auth');

router.use(authenticate, authorizeRole('SUPER_ADMIN'));

router.get('/users/pending', c.getPendingUsers);
router.patch('/users/:id/approve', c.approveUser);
router.patch('/users/:id/reject', c.rejectUser);

module.exports = router;
