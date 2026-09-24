const express = require('express');
const router = express.Router();
const c = require('../controllers/maintenanceController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getMaintenanceRecords);
router.get('/:id', c.getMaintenanceById);
router.post('/', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.createMaintenance);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateMaintenance);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteMaintenance);

module.exports = router;
