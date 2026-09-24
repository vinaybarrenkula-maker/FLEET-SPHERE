const express = require('express');
const router = express.Router();
const c = require('../controllers/vehicleController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getVehicles);
router.get('/:id', c.getVehicleById);
router.post('/', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.createVehicle);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateVehicle);
router.patch('/:id/status', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateVehicleStatus);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteVehicle);

module.exports = router;
