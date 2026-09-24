const express = require('express');
const router = express.Router();
const c = require('../controllers/dashboardController');
const { authenticate, authorizeBranch } = require('../middlewares/auth');

router.use(authenticate, authorizeBranch);
router.get('/overview', c.getOverview);
router.get('/fuel-analytics', c.getFuelAnalytics);
router.get('/maintenance-analytics', c.getMaintenanceAnalytics);
router.get('/trip-analytics', c.getTripAnalytics);
router.get('/expense-analytics', c.getExpenseAnalytics);

module.exports = router;
