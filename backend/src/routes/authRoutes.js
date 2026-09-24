const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.get('/org-branches', c.getPublicOrgBranches);
router.post('/register-driver', c.registerDriver);
router.post('/register', c.register); // Public generic registration disabled
router.post('/login', c.login);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);
router.post('/logout', authenticate, c.logout);
router.get('/me', authenticate, c.getMe);
router.put('/change-password', authenticate, c.changePassword);

module.exports = router;
