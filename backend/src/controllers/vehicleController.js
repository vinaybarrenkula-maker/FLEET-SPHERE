const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta, buildSearchFilter } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { exportToCSV, vehicleCSVHeaders } = require('../utils/csvExport');

exports.getVehicles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status, vehicleType, fuelType } = req.query;

    const filter = { ...req.branchFilter };
    if (status) filter.status = status;
    if (vehicleType) filter.vehicleType = vehicleType;
    if (fuelType) filter.fuelType = fuelType;
    if (search) {
      const s = buildSearchFilter(search, ['registrationNumber', 'manufacturer', 'model']);
      Object.assign(filter, s);
    }

    if (req.query.export === 'csv') {
      const all = await Vehicle.find(filter).lean();
      const data = all.map(v => ({
        registrationNumber: v.registrationNumber,
        vehicleType: v.vehicleType,
        manufacturer: v.manufacturer,
        model: v.model,
        year: v.year,
        fuelType: v.fuelType,
        currentMileage: v.currentMileage,
        status: v.status,
        insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString('en-IN') : '',
        registrationExpiry: v.registrationExpiry ? new Date(v.registrationExpiry).toLocaleDateString('en-IN') : '',
      }));
      return exportToCSV(res, data, vehicleCSVHeaders, 'vehicles');
    }

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).populate('branchId', 'name city').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);
    return paginatedResponse(res, vehicles, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ...req.branchFilter })
      .populate('branchId', 'name city')
      .populate('createdBy', 'name');
    if (!vehicle) return errorResponse(res, 'Vehicle not found.', 404);
    return successResponse(res, 'Vehicle retrieved.', { vehicle });
  } catch (err) { next(err); }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = req.user.role === 'SUPER_ADMIN' || req.user.role === 'FLEET_MANAGER'
      ? req.body.branchId : req.user.branchId;

    const vehicle = await Vehicle.create({ ...req.body, organizationId: orgId, branchId, createdBy: req.user._id });
    await auditFromReq(req, 'CREATE', 'Vehicle', vehicle._id, null, { registrationNumber: vehicle.registrationNumber });
    return successResponse(res, 'Vehicle created successfully.', { vehicle }, 201);
  } catch (err) { next(err); }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const old = await Vehicle.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Vehicle not found.', 404);
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Vehicle', vehicle._id, old.toObject(), req.body);
    return successResponse(res, 'Vehicle updated.', { vehicle });
  } catch (err) { next(err); }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!vehicle) return errorResponse(res, 'Vehicle not found.', 404);
    const activeTrip = await Trip.findOne({ vehicleId: vehicle._id, status: { $in: ['ASSIGNED', 'STARTED'] } });
    if (activeTrip) return errorResponse(res, 'Vehicle has an active trip. Cannot delete.', 409, 'VEHICLE_IN_USE');
    await Vehicle.findByIdAndDelete(req.params.id);
    await auditFromReq(req, 'DELETE', 'Vehicle', req.params.id, vehicle.toObject(), null);
    return successResponse(res, 'Vehicle deleted.');
  } catch (err) { next(err); }
};

exports.updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, ...req.branchFilter },
      { status },
      { new: true }
    );
    if (!vehicle) return errorResponse(res, 'Vehicle not found.', 404);
    return successResponse(res, 'Vehicle status updated.', { vehicle });
  } catch (err) { next(err); }
};
