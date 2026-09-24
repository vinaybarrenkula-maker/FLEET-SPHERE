const Branch = require('../models/Branch');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');

exports.getBranches = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = { ...req.branchFilter };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.name = new RegExp(req.query.search, 'i');

    const [branches, total] = await Promise.all([
      Branch.find(filter).populate('managerId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Branch.countDocuments(filter),
    ]);
    return paginatedResponse(res, branches, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getBranchById = async (req, res, next) => {
  try {
    const branch = await Branch.findOne({ _id: req.params.id, ...req.branchFilter }).populate('managerId', 'name email phone');
    if (!branch) return errorResponse(res, 'Branch not found.', 404);
    return successResponse(res, 'Branch retrieved.', { branch });
  } catch (err) { next(err); }
};

exports.createBranch = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branch = await Branch.create({ ...req.body, organizationId: orgId });
    await auditFromReq(req, 'CREATE', 'Branch', branch._id, null, { name: branch.name });
    return successResponse(res, 'Branch created successfully.', { branch }, 201);
  } catch (err) { next(err); }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const old = await Branch.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!old) return errorResponse(res, 'Branch not found.', 404);
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await auditFromReq(req, 'UPDATE', 'Branch', branch._id, old.toObject(), req.body);
    return successResponse(res, 'Branch updated.', { branch });
  } catch (err) { next(err); }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findOneAndDelete({ _id: req.params.id, ...req.branchFilter });
    if (!branch) return errorResponse(res, 'Branch not found.', 404);
    await auditFromReq(req, 'DELETE', 'Branch', req.params.id, branch.toObject(), null);
    return successResponse(res, 'Branch deleted.');
  } catch (err) { next(err); }
};
