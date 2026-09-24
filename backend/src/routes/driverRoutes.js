const express = require('express');
const router = express.Router();
const c = require('../controllers/driverController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/my-profile', authorizeRole('DRIVER'), c.getMyProfile);
router.get('/', c.getDrivers);
router.get('/:id', c.getDriverById);
router.post('/', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.createDriver);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateDriver);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteDriver);

module.exports = router;
