const express = require('express');
const router = express.Router();
const c = require('../controllers/routeController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getRoutes);
router.get('/:id', c.getRouteById);
router.post('/', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.createRoute);
router.put('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'), c.updateRoute);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteRoute);

module.exports = router;
