const express = require('express');
const router = express.Router();
const c = require('../controllers/incidentController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getIncidents);
router.get('/:id', c.getIncidentById);
router.post('/', c.createIncident);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateIncident);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteIncident);

module.exports = router;
