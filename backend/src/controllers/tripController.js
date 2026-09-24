const Trip = require('../models/Trip');
const TripStatusHistory = require('../models/TripStatusHistory');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta, buildSearchFilter } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { sendNotificationToRole } = require('../utils/notifications');
const { exportToCSV, tripCSVHeaders } = require('../utils/csvExport');

// Validate allocation: no overlapping trips for vehicle/driver
const checkAvailability = async (vehicleId, driverId, plannedStart, expectedEnd, excludeTripId = null) => {
  const start = new Date(plannedStart);
  const end = expectedEnd ? new Date(expectedEnd) : new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const overlap = {
    status: { $in: ['PLANNED', 'ASSIGNED', 'STARTED', 'DELAYED'] },
    $or: [
      { plannedStartTime: { $lt: end }, expectedEndTime: { $gt: start } },
      { plannedStartTime: { $gte: start, $lt: end } },
    ],
  };
  if (excludeTripId) overlap._id = { $ne: excludeTripId };

  const vehicleConflict = await Trip.findOne({ vehicleId, ...overlap });
  if (vehicleConflict) throw { message: `Vehicle is already assigned to trip ${vehicleConflict.tripNumber} during this time.`, code: 'VEHICLE_CONFLICT', status: 409 };

  const driverConflict = await Trip.findOne({ driverId, ...overlap });
  if (driverConflict) throw { message: `Driver is already assigned to trip ${driverConflict.tripNumber} during this time.`, code: 'DRIVER_CONFLICT', status: 409 };

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw { message: 'Vehicle not found.', code: 'VEHICLE_NOT_FOUND', status: 404 };
  if (vehicle.status === 'MAINTENANCE') throw { message: 'Vehicle is currently under maintenance and cannot be assigned.', code: 'VEHICLE_IN_MAINTENANCE', status: 409 };
  if (vehicle.status === 'INACTIVE') throw { message: 'Vehicle is inactive.', code: 'VEHICLE_INACTIVE', status: 409 };

  const driver = await Driver.findById(driverId);
  if (!driver) throw { message: 'Driver not found.', code: 'DRIVER_NOT_FOUND', status: 404 };
  if (driver.status === 'INACTIVE') throw { message: 'Driver is inactive and cannot be assigned.', code: 'DRIVER_INACTIVE', status: 409 };
  if (driver.status === 'ON_LEAVE') throw { message: 'Driver is on leave.', code: 'DRIVER_ON_LEAVE', status: 409 };
};

exports.getTrips = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status, vehicleId, driverId, startDate, endDate } = req.query;

    const filter = { ...req.branchFilter };
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;
    if (startDate || endDate) {
      filter.plannedStartTime = {};
      if (startDate) filter.plannedStartTime.$gte = new Date(startDate);
      if (endDate) filter.plannedStartTime.$lte = new Date(endDate);
    }
    if (search) filter.tripNumber = new RegExp(search, 'i');

    // Drivers see only their own trips
    if (req.user.role === 'DRIVER') {
      const driver = await Driver.findOne({ userId: req.user._id });
      if (driver) filter.driverId = driver._id;
    }

    if (req.query.export === 'csv') {
      const all = await Trip.find(filter)
        .populate('vehicleId', 'registrationNumber')
        .populate('driverId', 'userId')
        .populate('routeId', 'origin destination')
        .lean();
      const data = all.map(t => ({
        tripNumber: t.tripNumber,
        vehicleReg: t.vehicleId?.registrationNumber || '',
        driverName: '',
        origin: t.routeId?.origin?.city || '',
        destination: t.routeId?.destination?.city || '',
        plannedStartTime: t.plannedStartTime ? new Date(t.plannedStartTime).toLocaleDateString('en-IN') : '',
        actualStartTime: t.actualStartTime ? new Date(t.actualStartTime).toLocaleDateString('en-IN') : '',
        actualEndTime: t.actualEndTime ? new Date(t.actualEndTime).toLocaleDateString('en-IN') : '',
        status: t.status,
        totalDistance: t.totalDistance || '',
      }));
      return exportToCSV(res, data, tripCSVHeaders, 'trips');
    }

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate('vehicleId', 'registrationNumber vehicleType')
        .populate({ path: 'driverId', populate: { path: 'userId', select: 'name' } })
        .populate('routeId', 'origin destination distance')
        .sort({ plannedStartTime: -1 })
        .skip(skip).limit(limit),
      Trip.countDocuments(filter),
    ]);
    return paginatedResponse(res, trips, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getTripById = async (req, res, next) => {
  try {
    const tripFilter = { _id: req.params.id, ...req.branchFilter };
    if (req.user.role === 'DRIVER') {
      const driver = await Driver.findOne({ userId: req.user._id });
      if (driver) tripFilter.driverId = driver._id;
    }
    const trip = await Trip.findOne(tripFilter)
      .populate('vehicleId')
      .populate({ path: 'driverId', populate: { path: 'userId', select: 'name email phone' } })
      .populate('routeId')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    if (!trip) return errorResponse(res, 'Trip not found.', 404);
    const history = await TripStatusHistory.find({ tripId: trip._id }).populate('changedBy', 'name role').sort({ timestamp: 1 });
    return successResponse(res, 'Trip retrieved.', { trip, history });
  } catch (err) { next(err); }
};

exports.createTrip = async (req, res, next) => {
  try {
    const { vehicleId, driverId, plannedStartTime, expectedEndTime } = req.body;
    try {
      await checkAvailability(vehicleId, driverId, plannedStartTime, expectedEndTime);
    } catch (conflict) {
      return errorResponse(res, conflict.message, conflict.status || 409, conflict.code);
    }

    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;

    const trip = await Trip.create({ ...req.body, organizationId: orgId, branchId, createdBy: req.user._id, status: 'PLANNED' });

    await TripStatusHistory.create({ tripId: trip._id, previousStatus: null, newStatus: 'PLANNED', changedBy: req.user._id, reason: 'Trip created' });
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'ASSIGNED' });
    await Driver.findByIdAndUpdate(driverId, { status: 'ASSIGNED' });

    // Notify the driver
    const driver = await Driver.findById(driverId).populate('userId', '_id');
    if (driver?.userId) {
      await sendNotificationToRole(orgId, branchId, ['DRIVER'], {
        notificationType: 'TRIP_ASSIGNED',
        title: 'New Trip Assigned',
        message: `You have been assigned trip ${trip.tripNumber}.`,
        relatedEntity: { entityType: 'Trip', entityId: trip._id },
      });
    }

    await auditFromReq(req, 'CREATE', 'Trip', trip._id, null, { tripNumber: trip.tripNumber });
    return successResponse(res, 'Trip created successfully.', { trip }, 201);
  } catch (err) { next(err); }
};

exports.updateTripStatus = async (req, res, next) => {
  try {
    const { status, reason, notes, startMileage, endMileage } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!trip) return errorResponse(res, 'Trip not found.', 404);

    // Business rules
    if (trip.status === 'COMPLETED') return errorResponse(res, 'Completed trips cannot be modified.', 409, 'TRIP_COMPLETED');
    if (trip.status === 'CANCELLED') return errorResponse(res, 'Cancelled trips cannot be restarted.', 409, 'TRIP_CANCELLED');

    const validTransitions = {
      PLANNED: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['STARTED', 'CANCELLED'],
      STARTED: ['DELAYED', 'COMPLETED'],
      DELAYED: ['STARTED', 'COMPLETED', 'CANCELLED'],
    };

    if (!validTransitions[trip.status]?.includes(status)) {
      return errorResponse(res, `Cannot transition from ${trip.status} to ${status}.`, 409, 'INVALID_TRANSITION');
    }

    const updates = { status, updatedBy: req.user._id };
    if (status === 'STARTED') { updates.actualStartTime = new Date(); if (startMileage) updates.startMileage = startMileage; }
    if (status === 'COMPLETED') {
      updates.actualEndTime = new Date();
      if (endMileage) {
        updates.endMileage = endMileage;
        updates.totalDistance = endMileage - (trip.startMileage || 0);
      }
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'AVAILABLE', currentMileage: endMileage || undefined });
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'AVAILABLE', $inc: { totalTrips: 1, totalKm: updates.totalDistance || 0 } });
    }
    if (status === 'CANCELLED') {
      if (reason) updates.cancellationReason = reason;
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'AVAILABLE' });
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'AVAILABLE' });
    }
    if (status === 'DELAYED') {
      if (reason) updates.delayReason = reason;
      await sendNotificationToRole(trip.organizationId, trip.branchId, ['FLEET_MANAGER', 'BRANCH_MANAGER'], {
        notificationType: 'TRIP_DELAYED',
        title: 'Trip Delayed',
        message: `Trip ${trip.tripNumber} has been marked as delayed. Reason: ${reason || 'Not specified'}`,
        relatedEntity: { entityType: 'Trip', entityId: trip._id },
      });
    }

    await TripStatusHistory.create({ tripId: trip._id, previousStatus: trip.status, newStatus: status, changedBy: req.user._id, reason, notes });
    const updated = await Trip.findByIdAndUpdate(trip._id, updates, { new: true });
    await auditFromReq(req, 'UPDATE', 'Trip', trip._id, { status: trip.status }, { status });
    return successResponse(res, `Trip status updated to ${status}.`, { trip: updated });
  } catch (err) { next(err); }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const old = await Trip.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Trip not found.', 404);
    if (['COMPLETED', 'CANCELLED'].includes(old.status)) return errorResponse(res, 'Cannot edit a completed or cancelled trip.', 409);
    const trip = await Trip.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Trip', trip._id, old.toObject(), req.body);
    return successResponse(res, 'Trip updated.', { trip });
  } catch (err) { next(err); }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!trip) return errorResponse(res, 'Trip not found.', 404);
    if (['STARTED', 'DELAYED'].includes(trip.status)) return errorResponse(res, 'Cannot delete an active trip.', 409);
    await Trip.findByIdAndDelete(req.params.id);
    await TripStatusHistory.deleteMany({ tripId: req.params.id });
    await auditFromReq(req, 'DELETE', 'Trip', req.params.id, trip.toObject(), null);
    return successResponse(res, 'Trip deleted.');
  } catch (err) { next(err); }
};
