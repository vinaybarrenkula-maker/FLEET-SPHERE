const Driver = require('../models/Driver');
const User = require('../models/User');
const Trip = require('../models/Trip');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta, buildSearchFilter } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { exportToCSV, driverCSVHeaders } = require('../utils/csvExport');

exports.getDrivers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status, licenseType } = req.query;
    const filter = { ...req.branchFilter };
    if (status) filter.status = status;
    if (licenseType) filter.licenseType = licenseType;

    if (req.query.export === 'csv') {
      const all = await Driver.find(filter).populate('userId', 'name').lean();
      const data = all.map(d => ({
        name: d.userId?.name || '',
        employeeId: d.employeeId,
        phone: d.phone,
        licenseNumber: d.licenseNumber,
        licenseType: d.licenseType,
        licenseExpiry: d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString('en-IN') : '',
        status: d.status,
        totalTrips: d.totalTrips,
        totalKm: d.totalKm,
      }));
      return exportToCSV(res, data, driverCSVHeaders, 'drivers');
    }

    let driverQuery = Driver.find(filter).populate('userId', 'name email profileImage').populate('assignedVehicle', 'registrationNumber vehicleType').populate('branchId', 'name city');

    if (search) {
      const users = await User.find(buildSearchFilter(search, ['name', 'email'])).select('_id');
      const userIds = users.map(u => u._id);
      filter.$or = [{ employeeId: new RegExp(search, 'i') }, { licenseNumber: new RegExp(search, 'i') }, { userId: { $in: userIds } }];
    }

    const [drivers, total] = await Promise.all([
      Driver.find(filter).populate('userId', 'name email profileImage').populate('assignedVehicle', 'registrationNumber').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Driver.countDocuments(filter),
    ]);
    return paginatedResponse(res, drivers, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, ...req.branchFilter })
      .populate('userId', 'name email phone profileImage lastLogin')
      .populate('assignedVehicle', 'registrationNumber vehicleType manufacturer model')
      .populate('branchId', 'name city');
    if (!driver) return errorResponse(res, 'Driver not found.', 404);
    return successResponse(res, 'Driver retrieved.', { driver });
  } catch (err) { next(err); }
};

exports.createDriver = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = req.user.role === 'SUPER_ADMIN' || req.user.role === 'FLEET_MANAGER' ? req.body.branchId : req.user.branchId;
    const driver = await Driver.create({ ...req.body, organizationId: orgId, branchId });
    await auditFromReq(req, 'CREATE', 'Driver', driver._id, null, { employeeId: driver.employeeId });
    return successResponse(res, 'Driver created successfully.', { driver }, 201);
  } catch (err) { next(err); }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const old = await Driver.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Driver not found.', 404);
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Driver', driver._id, old.toObject(), req.body);
    return successResponse(res, 'Driver updated.', { driver });
  } catch (err) { next(err); }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!driver) return errorResponse(res, 'Driver not found.', 404);
    const activeTrip = await Trip.findOne({ driverId: driver._id, status: { $in: ['ASSIGNED', 'STARTED'] } });
    if (activeTrip) return errorResponse(res, 'Driver has an active trip. Cannot delete.', 409, 'DRIVER_IN_USE');
    await Driver.findByIdAndDelete(req.params.id);
    await auditFromReq(req, 'DELETE', 'Driver', req.params.id, driver.toObject(), null);
    return successResponse(res, 'Driver deleted.');
  } catch (err) { next(err); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone profileImage')
      .populate('assignedVehicle', 'registrationNumber vehicleType manufacturer model');
    if (!driver) return errorResponse(res, 'Driver profile not found.', 404);
    return successResponse(res, 'Driver profile retrieved.', { driver });
  } catch (err) { next(err); }
};
