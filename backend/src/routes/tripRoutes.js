const express = require('express');
const router = express.Router();
const c = require('../controllers/tripController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getTrips);
router.get('/:id', c.getTripById);
router.post('/', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.createTrip);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateTrip);
router.patch('/:id/status', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','DRIVER'), c.updateTripStatus);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteTrip);

module.exports = router;
