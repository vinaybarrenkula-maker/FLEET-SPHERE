const express = require('express');
const router = express.Router();
const c = require('../controllers/fuelController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getFuelEntries);
router.get('/:id', c.getFuelEntryById);
router.post('/', c.createFuelEntry);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateFuelEntry);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteFuelEntry);

module.exports = router;
