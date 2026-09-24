const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { sendNotificationToRole } = require('../utils/notifications');
const { exportToCSV, maintenanceCSVHeaders } = require('../utils/csvExport');

exports.getMaintenanceRecords = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { vehicleId, status, serviceType, startDate, endDate } = req.query;
    const filter = { ...req.branchFilter };
    if (vehicleId) filter.vehicleId = vehicleId;
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    // Auto-mark overdue
    const now = new Date();
    await Maintenance.updateMany(
      { ...req.branchFilter, status: 'SCHEDULED', scheduledDate: { $lt: now } },
      { $set: { status: 'OVERDUE' } }
    );

    if (req.query.export === 'csv') {
      const all = await Maintenance.find(filter).populate('vehicleId', 'registrationNumber').lean();
      const data = all.map(m => ({
        vehicleReg: m.vehicleId?.registrationNumber || '',
        serviceType: m.serviceType,
        description: m.description || '',
        scheduledDate: m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString('en-IN') : '',
        completedDate: m.completedDate ? new Date(m.completedDate).toLocaleDateString('en-IN') : '',
        actualCost: m.actualCost || '',
        vendor: m.vendor?.name || '',
        status: m.status,
      }));
      return exportToCSV(res, data, maintenanceCSVHeaders, 'maintenance');
    }

    const [records, total] = await Promise.all([
      Maintenance.find(filter).populate('vehicleId', 'registrationNumber vehicleType').populate('createdBy', 'name').sort({ scheduledDate: -1 }).skip(skip).limit(limit),
      Maintenance.countDocuments(filter),
    ]);
    return paginatedResponse(res, records, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getMaintenanceById = async (req, res, next) => {
  try {
    const record = await Maintenance.findOne({ _id: req.params.id, ...req.branchFilter })
      .populate('vehicleId', 'registrationNumber vehicleType currentMileage')
      .populate('createdBy', 'name')
      .populate('completedBy', 'name');
    if (!record) return errorResponse(res, 'Maintenance record not found.', 404);
    return successResponse(res, 'Maintenance record retrieved.', { maintenance: record });
  } catch (err) { next(err); }
};

exports.createMaintenance = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;

    // Mark vehicle as MAINTENANCE if status is IN_PROGRESS
    if (req.body.status === 'IN_PROGRESS') {
      await Vehicle.findByIdAndUpdate(req.body.vehicleId, { status: 'MAINTENANCE' });
    }

    const record = await Maintenance.create({ ...req.body, organizationId: orgId, branchId, createdBy: req.user._id });
    await auditFromReq(req, 'CREATE', 'Maintenance', record._id, null, { vehicleId: record.vehicleId, serviceType: record.serviceType });
    return successResponse(res, 'Maintenance record created.', { maintenance: record }, 201);
  } catch (err) { next(err); }
};

exports.updateMaintenance = async (req, res, next) => {
  try {
    const old = await Maintenance.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Maintenance record not found.', 404);

    if (req.body.status === 'COMPLETED' && old.status !== 'COMPLETED') {
      req.body.completedBy = req.user._id;
      req.body.completedDate = req.body.completedDate || new Date();
      await Vehicle.findByIdAndUpdate(old.vehicleId, { status: 'AVAILABLE' });
    }
    if (req.body.status === 'IN_PROGRESS' && old.status !== 'IN_PROGRESS') {
      await Vehicle.findByIdAndUpdate(old.vehicleId, { status: 'MAINTENANCE' });
    }

    const record = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Maintenance', record._id, old.toObject(), req.body);
    return successResponse(res, 'Maintenance record updated.', { maintenance: record });
  } catch (err) { next(err); }
};

exports.deleteMaintenance = async (req, res, next) => {
  try {
    const record = await Maintenance.findOneAndDelete({ _id: req.params.id, ...req.branchFilter });
    if (!record) return errorResponse(res, 'Maintenance record not found.', 404);
    await auditFromReq(req, 'DELETE', 'Maintenance', req.params.id, record.toObject(), null);
    return successResponse(res, 'Maintenance record deleted.');
  } catch (err) { next(err); }
};
