const Organization = require('../models/Organization');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');

exports.getOrganizations = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.name = new RegExp(req.query.search, 'i');

    const [orgs, total] = await Promise.all([
      Organization.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Organization.countDocuments(filter),
    ]);
    return paginatedResponse(res, orgs, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return errorResponse(res, 'Organization not found.', 404);
    return successResponse(res, 'Organization retrieved.', { organization: org });
  } catch (err) { next(err); }
};

exports.createOrganization = async (req, res, next) => {
  try {
    const org = await Organization.create(req.body);
    await auditFromReq(req, 'CREATE', 'Organization', org._id, null, { name: org.name });
    return successResponse(res, 'Organization created successfully.', { organization: org }, 201);
  } catch (err) { next(err); }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const old = await Organization.findById(req.params.id);
    if (!old) return errorResponse(res, 'Organization not found.', 404);
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Organization', org._id, old.toObject(), req.body);
    return successResponse(res, 'Organization updated.', { organization: org });
  } catch (err) { next(err); }
};

exports.deleteOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) return errorResponse(res, 'Organization not found.', 404);
    await auditFromReq(req, 'DELETE', 'Organization', req.params.id, org.toObject(), null);
    return successResponse(res, 'Organization deleted.');
  } catch (err) { next(err); }
};
