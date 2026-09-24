const express = require('express');
const router = express.Router();
const c = require('../controllers/auditController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch, authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'));
router.get('/', c.getAuditLogs);

module.exports = router;
