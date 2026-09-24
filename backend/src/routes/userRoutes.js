const express = require('express');
const router = express.Router();
const c = require('../controllers/userController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', authorizeRole('SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER'), c.getUsers);
router.get('/:id', authorizeRole('SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER'), c.getUserById);
router.post('/', authorizeRole('SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER'), c.createUser);
router.put('/:id', authorizeRole('SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER'), c.updateUser);
router.delete('/:id', authorizeRole('SUPER_ADMIN'), c.deleteUser);

module.exports = router;
