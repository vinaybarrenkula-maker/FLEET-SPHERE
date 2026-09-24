const express = require('express');
const router = express.Router();
const c = require('../controllers/branchController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getBranches);
router.get('/:id', c.getBranchById);
router.post('/', authorizeRole('SUPER_ADMIN', 'FLEET_MANAGER'), c.createBranch);
router.put('/:id', authorizeRole('SUPER_ADMIN', 'FLEET_MANAGER'), c.updateBranch);
router.delete('/:id', authorizeRole('SUPER_ADMIN'), c.deleteBranch);

module.exports = router;
