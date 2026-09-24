const Route = require('../models/Route');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta, buildSearchFilter } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');

exports.getRoutes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = { ...req.branchFilter };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const r = new RegExp(req.query.search, 'i');
      filter.$or = [{ routeCode: r }, { 'origin.city': r }, { 'destination.city': r }];
    }
    const [routes, total] = await Promise.all([
      Route.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Route.countDocuments(filter),
    ]);
    return paginatedResponse(res, routes, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, ...req.branchFilter }).populate('createdBy', 'name');
    if (!route) return errorResponse(res, 'Route not found.', 404);
    return successResponse(res, 'Route retrieved.', { route });
  } catch (err) { next(err); }
};

exports.createRoute = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;
    const route = await Route.create({ ...req.body, organizationId: orgId, branchId, createdBy: req.user._id });
    await auditFromReq(req, 'CREATE', 'Route', route._id, null, { routeCode: route.routeCode });
    return successResponse(res, 'Route created.', { route }, 201);
  } catch (err) { next(err); }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const old = await Route.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Route not found.', 404);
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Route', route._id, old.toObject(), req.body);
    return successResponse(res, 'Route updated.', { route });
  } catch (err) { next(err); }
};

exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findOneAndDelete({ _id: req.params.id, ...req.branchFilter });
    if (!route) return errorResponse(res, 'Route not found.', 404);
    await auditFromReq(req, 'DELETE', 'Route', req.params.id, route.toObject(), null);
    return successResponse(res, 'Route deleted.');
  } catch (err) { next(err); }
};
