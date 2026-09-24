const FuelEntry = require('../models/FuelEntry');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { exportToCSV, fuelCSVHeaders } = require('../utils/csvExport');
const Driver = require('../models/Driver');

exports.getFuelEntries = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { vehicleId, driverId, startDate, endDate } = req.query;
    const filter = { ...req.branchFilter };
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (req.user.role === 'DRIVER') {
      const driver = await Driver.findOne({ userId: req.user._id });
      if (driver) filter.driverId = driver._id;
    }

    if (req.query.export === 'csv') {
      const all = await FuelEntry.find(filter).populate('vehicleId', 'registrationNumber').populate({ path: 'driverId', populate: { path: 'userId', select: 'name' } }).lean();
      const data = all.map(f => ({
        date: new Date(f.date).toLocaleDateString('en-IN'),
        vehicleReg: f.vehicleId?.registrationNumber || '',
        driverName: f.driverId?.userId?.name || '',
        fuelType: f.fuelType,
        quantity: f.quantity,
        pricePerUnit: f.pricePerUnit,
        totalCost: f.totalCost,
        odometer: f.odometer,
        fuelStation: f.fuelStation || '',
      }));
      return exportToCSV(res, data, fuelCSVHeaders, 'fuel-entries');
    }

    const [entries, total] = await Promise.all([
      FuelEntry.find(filter)
        .populate('vehicleId', 'registrationNumber vehicleType')
        .populate({ path: 'driverId', populate: { path: 'userId', select: 'name' } })
        .populate('tripId', 'tripNumber')
        .sort({ date: -1 }).skip(skip).limit(limit),
      FuelEntry.countDocuments(filter),
    ]);
    return paginatedResponse(res, entries, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getFuelEntryById = async (req, res, next) => {
  try {
    const entry = await FuelEntry.findOne({ _id: req.params.id, ...req.branchFilter })
      .populate('vehicleId', 'registrationNumber')
      .populate({ path: 'driverId', populate: { path: 'userId', select: 'name' } });
    if (!entry) return errorResponse(res, 'Fuel entry not found.', 404);
    return successResponse(res, 'Fuel entry retrieved.', { fuelEntry: entry });
  } catch (err) { next(err); }
};

exports.createFuelEntry = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;
    const entry = await FuelEntry.create({ ...req.body, organizationId: orgId, branchId, submittedBy: req.user._id });
    await auditFromReq(req, 'CREATE', 'FuelEntry', entry._id, null, { vehicleId: entry.vehicleId, totalCost: entry.totalCost });
    return successResponse(res, 'Fuel entry recorded.', { fuelEntry: entry }, 201);
  } catch (err) { next(err); }
};

exports.updateFuelEntry = async (req, res, next) => {
  try {
    const old = await FuelEntry.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Fuel entry not found.', 404);
    const entry = await FuelEntry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'FuelEntry', entry._id, old.toObject(), req.body);
    return successResponse(res, 'Fuel entry updated.', { fuelEntry: entry });
  } catch (err) { next(err); }
};

exports.deleteFuelEntry = async (req, res, next) => {
  try {
    const entry = await FuelEntry.findOneAndDelete({ _id: req.params.id, ...req.branchFilter });
    if (!entry) return errorResponse(res, 'Fuel entry not found.', 404);
    await auditFromReq(req, 'DELETE', 'FuelEntry', req.params.id, entry.toObject(), null);
    return successResponse(res, 'Fuel entry deleted.');
  } catch (err) { next(err); }
};
