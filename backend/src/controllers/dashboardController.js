const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelEntry = require('../models/FuelEntry');
const Maintenance = require('../models/Maintenance');
const Incident = require('../models/Incident');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const { successResponse } = require('../utils/response');

// GET /api/dashboard/overview
exports.getOverview = async (req, res, next) => {
  try {
    const f = req.branchFilter;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalVehicles, availableVehicles, vehiclesOnTrip, vehiclesMaintenance,
      totalDrivers, activeDrivers,
      tripsToday, completedTripsTotal, delayedTrips, cancelledTrips,
      pendingExpenses,
    ] = await Promise.all([
      Vehicle.countDocuments(f),
      Vehicle.countDocuments({ ...f, status: 'AVAILABLE' }),
      Vehicle.countDocuments({ ...f, status: { $in: ['ON_TRIP', 'ASSIGNED'] } }),
      Vehicle.countDocuments({ ...f, status: 'MAINTENANCE' }),
      Driver.countDocuments(f),
      Driver.countDocuments({ ...f, status: { $in: ['AVAILABLE', 'ASSIGNED', 'ON_TRIP'] } }),
      Trip.countDocuments({ ...f, plannedStartTime: { $gte: today, $lt: tomorrow } }),
      Trip.countDocuments({ ...f, status: 'COMPLETED' }),
      Trip.countDocuments({ ...f, status: 'DELAYED' }),
      Trip.countDocuments({ ...f, status: 'CANCELLED', createdAt: { $gte: thirtyDaysAgo } }),
      Expense.countDocuments({ ...f, status: 'PENDING' }),
    ]);

    // Financial totals (last 30 days)
    const [fuelCostResult, maintenanceCostResult, expenseCostResult] = await Promise.all([
      FuelEntry.aggregate([{ $match: { ...f, date: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$totalCost' } } }]),
      Maintenance.aggregate([{ $match: { ...f, status: 'COMPLETED', completedDate: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$actualCost' } } }]),
      Expense.aggregate([{ $match: { ...f, status: 'APPROVED', date: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const fuelCost30d = fuelCostResult[0]?.total || 0;
    const maintenanceCost30d = maintenanceCostResult[0]?.total || 0;
    const expenseCost30d = expenseCostResult[0]?.total || 0;
    const totalOperationalCost = fuelCost30d + maintenanceCost30d + expenseCost30d;
    const fleetUtilization = totalVehicles > 0 ? Math.round(((vehiclesOnTrip + vehiclesMaintenance) / totalVehicles) * 100) : 0;

    // Expiring documents (next 30 days)
    const thirtyDaysFromNow = new Date(); thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const [expiringInsurance, expiringLicenses] = await Promise.all([
      Vehicle.countDocuments({ ...f, insuranceExpiry: { $gte: today, $lte: thirtyDaysFromNow } }),
      Driver.countDocuments({ ...f, licenseExpiry: { $gte: today, $lte: thirtyDaysFromNow } }),
    ]);

    // SUPER_ADMIN: add org/branch/user counts
    let adminStats = {};
    if (req.user.role === 'SUPER_ADMIN') {
      const [totalOrgs, totalBranches, totalUsers] = await Promise.all([
        Organization.countDocuments({}),
        Branch.countDocuments({}),
        User.countDocuments({}),
      ]);
      adminStats = { totalOrganizations: totalOrgs, totalBranches, totalUsers };
    }

    return successResponse(res, 'Dashboard overview retrieved.', {
      fleet: { totalVehicles, availableVehicles, vehiclesOnTrip, vehiclesMaintenance, fleetUtilization },
      drivers: { totalDrivers, activeDrivers },
      trips: { tripsToday, completedTripsTotal, delayedTrips, cancelledTrips },
      financials: { fuelCost30d, maintenanceCost30d, expenseCost30d, totalOperationalCost, pendingExpenses },
      alerts: { expiringInsurance, expiringLicenses },
      ...adminStats,
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/fuel-analytics
exports.getFuelAnalytics = async (req, res, next) => {
  try {
    const f = req.branchFilter;
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date(); startDate.setMonth(startDate.getMonth() - months);

    const [monthly, byVehicle, byFuelType] = await Promise.all([
      FuelEntry.aggregate([
        { $match: { ...f, date: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, totalCost: { $sum: '$totalCost' }, totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      FuelEntry.aggregate([
        { $match: { ...f, date: { $gte: startDate } } },
        { $group: { _id: '$vehicleId', totalCost: { $sum: '$totalCost' }, totalQuantity: { $sum: '$quantity' } } },
        { $lookup: { from: 'vehicles', localField: '_id', foreignField: '_id', as: 'vehicle' } },
        { $unwind: '$vehicle' },
        { $project: { registrationNumber: '$vehicle.registrationNumber', totalCost: 1, totalQuantity: 1 } },
        { $sort: { totalCost: -1 } }, { $limit: 10 },
      ]),
      FuelEntry.aggregate([
        { $match: { ...f, date: { $gte: startDate } } },
        { $group: { _id: '$fuelType', totalCost: { $sum: '$totalCost' }, totalQuantity: { $sum: '$quantity' } } },
      ]),
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyFormatted = monthly.map(m => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      totalCost: Math.round(m.totalCost),
      totalQuantity: Math.round(m.totalQuantity * 100) / 100,
      entries: m.count,
    }));

    return successResponse(res, 'Fuel analytics retrieved.', { monthly: monthlyFormatted, byVehicle, byFuelType });
  } catch (err) { next(err); }
};

// GET /api/dashboard/maintenance-analytics
exports.getMaintenanceAnalytics = async (req, res, next) => {
  try {
    const f = req.branchFilter;
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date(); startDate.setMonth(startDate.getMonth() - months);
    const now = new Date();
    const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);

    const [statusBreakdown, monthly, overdueVehicles, dueSoonVehicles, byServiceType] = await Promise.all([
      Maintenance.aggregate([{ $match: f }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Maintenance.aggregate([
        { $match: { ...f, status: 'COMPLETED', completedDate: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$completedDate' }, month: { $month: '$completedDate' } }, totalCost: { $sum: '$actualCost' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Maintenance.countDocuments({ ...f, status: 'OVERDUE' }),
      Maintenance.countDocuments({ ...f, status: 'SCHEDULED', scheduledDate: { $gte: now, $lte: thirtyDays } }),
      Maintenance.aggregate([{ $match: { ...f, status: 'COMPLETED' } }, { $group: { _id: '$serviceType', count: { $sum: 1 }, totalCost: { $sum: '$actualCost' } } }, { $sort: { count: -1 } }]),
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyFormatted = monthly.map(m => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      totalCost: Math.round(m.totalCost),
      count: m.count,
    }));

    return successResponse(res, 'Maintenance analytics retrieved.', { statusBreakdown, monthly: monthlyFormatted, overdueVehicles, dueSoonVehicles, byServiceType });
  } catch (err) { next(err); }
};

// GET /api/dashboard/trip-analytics
exports.getTripAnalytics = async (req, res, next) => {
  try {
    const f = req.branchFilter;
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date(); startDate.setMonth(startDate.getMonth() - months);

    const [statusBreakdown, monthly, topRoutes] = await Promise.all([
      Trip.aggregate([{ $match: f }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Trip.aggregate([
        { $match: { ...f, plannedStartTime: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$plannedStartTime' }, month: { $month: '$plannedStartTime' } }, count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Trip.aggregate([
        { $match: { ...f, status: 'COMPLETED' } },
        { $group: { _id: '$routeId', count: { $sum: 1 } } },
        { $lookup: { from: 'routes', localField: '_id', foreignField: '_id', as: 'route' } },
        { $unwind: '$route' },
        { $project: { routeCode: '$route.routeCode', origin: '$route.origin.city', destination: '$route.destination.city', count: 1 } },
        { $sort: { count: -1 } }, { $limit: 5 },
      ]),
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyFormatted = monthly.map(m => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
      completed: m.completed,
    }));

    return successResponse(res, 'Trip analytics retrieved.', { statusBreakdown, monthly: monthlyFormatted, topRoutes });
  } catch (err) { next(err); }
};

// GET /api/dashboard/expense-analytics
exports.getExpenseAnalytics = async (req, res, next) => {
  try {
    const f = req.branchFilter;
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date(); startDate.setMonth(startDate.getMonth() - months);

    const [statusBreakdown, byCategory, monthly] = await Promise.all([
      Expense.aggregate([{ $match: f }, { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { ...f, status: 'APPROVED', date: { $gte: startDate } } }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Expense.aggregate([
        { $match: { ...f, date: { $gte: startDate } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' }, approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, '$amount', 0] } } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyFormatted = monthly.map(m => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      total: Math.round(m.total),
      approved: Math.round(m.approved),
    }));

    return successResponse(res, 'Expense analytics retrieved.', { statusBreakdown, byCategory, monthly: monthlyFormatted });
  } catch (err) { next(err); }
};
