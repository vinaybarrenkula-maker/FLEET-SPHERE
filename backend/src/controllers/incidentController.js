const Incident = require('../models/Incident');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { sendNotificationToRole } = require('../utils/notifications');
const { exportToCSV, incidentCSVHeaders } = require('../utils/csvExport');
const Driver = require('../models/Driver');

exports.getIncidents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { vehicleId, status, severity, startDate, endDate } = req.query;
    const filter = { ...req.branchFilter };
    if (vehicleId) filter.vehicleId = vehicleId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (startDate || endDate) {
      filter.incidentDate = {};
      if (startDate) filter.incidentDate.$gte = new Date(startDate);
      if (endDate) filter.incidentDate.$lte = new Date(endDate);
    }
    if (req.user.role === 'DRIVER') {
      const driver = await Driver.findOne({ userId: req.user._id });
      if (driver) filter.driverId = driver._id;
    }

    if (req.query.export === 'csv') {
      const all = await Incident.find(filter).populate('vehicleId', 'registrationNumber').populate({ path: 'driverId', populate: { path: 'userId', select: 'name' } }).lean();
      const data = all.map(i => ({
        incidentDate: new Date(i.incidentDate).toLocaleDateString('en-IN'),
        incidentType: i.incidentType,
        severity: i.severity,
        location: `${i.location?.city || ''}, ${i.location?.state || ''}`,
        vehicleReg: i.vehicleId?.registrationNumber || '',
        driverName: i.driverId?.userId?.name || '',
        description: i.description,
        status: i.status,
      }));
      return exportToCSV(res, data, incidentCSVHeaders, 'incidents');
    }

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate('vehicleId', 'registrationNumber vehicleType')
        .populate({ path: 'driverId', populate: { path: 'userId', select: 'name' } })
        .populate('reportedBy', 'name')
        .sort({ incidentDate: -1 }).skip(skip).limit(limit),
      Incident.countDocuments(filter),
    ]);
    return paginatedResponse(res, incidents, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findOne({ _id: req.params.id, ...req.branchFilter })
      .populate('vehicleId')
      .populate({ path: 'driverId', populate: { path: 'userId', select: 'name email phone' } })
      .populate('tripId', 'tripNumber')
      .populate('reportedBy', 'name role')
      .populate('investigatedBy', 'name')
      .populate('resolvedBy', 'name');
    if (!incident) return errorResponse(res, 'Incident not found.', 404);
    return successResponse(res, 'Incident retrieved.', { incident });
  } catch (err) { next(err); }
};

exports.createIncident = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;

    const incident = await Incident.create({ ...req.body, organizationId: orgId, branchId, reportedBy: req.user._id });

    // Critical incidents → notify managers
    if (incident.severity === 'CRITICAL' || incident.severity === 'HIGH') {
      await sendNotificationToRole(orgId, branchId, ['FLEET_MANAGER', 'BRANCH_MANAGER', 'SUPER_ADMIN'], {
        notificationType: 'INCIDENT_REPORTED',
        title: `${incident.severity} Incident Reported`,
        message: `A ${incident.severity.toLowerCase()} severity incident has been reported: ${incident.description.substring(0, 100)}`,
        relatedEntity: { entityType: 'Incident', entityId: incident._id },
      });
    }

    await auditFromReq(req, 'CREATE', 'Incident', incident._id, null, { incidentType: incident.incidentType, severity: incident.severity });
    return successResponse(res, 'Incident reported successfully.', { incident }, 201);
  } catch (err) { next(err); }
};

exports.updateIncident = async (req, res, next) => {
  try {
    const old = await Incident.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Incident not found.', 404);
    if (req.body.status === 'RESOLVED' && old.status !== 'RESOLVED') {
      req.body.resolvedBy = req.user._id;
      req.body.resolvedAt = new Date();
    }
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Incident', incident._id, { status: old.status }, { status: incident.status });
    return successResponse(res, 'Incident updated.', { incident });
  } catch (err) { next(err); }
};

exports.deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findOneAndDelete({ _id: req.params.id, ...req.branchFilter });
    if (!incident) return errorResponse(res, 'Incident not found.', 404);
    await auditFromReq(req, 'DELETE', 'Incident', req.params.id, incident.toObject(), null);
    return successResponse(res, 'Incident deleted.');
  } catch (err) { next(err); }
};
