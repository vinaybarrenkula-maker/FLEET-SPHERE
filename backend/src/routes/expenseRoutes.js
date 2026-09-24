const express = require('express');
const router = express.Router();
const c = require('../controllers/expenseController');
const { authenticate, authorizeRole, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/', c.getExpenses);
router.get('/:id', c.getExpenseById);
router.post('/', c.createExpense);
router.patch('/:id/approve', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','FINANCE_OFFICER'), c.approveExpense);
router.patch('/:id/reject', authorizeRole('SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','FINANCE_OFFICER'), c.rejectExpense);
router.delete('/:id', authorizeRole('SUPER_ADMIN','FLEET_MANAGER'), c.deleteExpense);

module.exports = router;
