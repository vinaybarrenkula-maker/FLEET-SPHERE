const express = require('express');
const router = express.Router();
const c = require('../controllers/organizationController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getOrganizations);
router.get('/:id', c.getOrganizationById);
router.post('/', authorizeRole('SUPER_ADMIN'), c.createOrganization);
router.put('/:id', authorizeRole('SUPER_ADMIN'), c.updateOrganization);
router.delete('/:id', authorizeRole('SUPER_ADMIN'), c.deleteOrganization);

module.exports = router;
