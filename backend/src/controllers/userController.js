const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta, buildSearchFilter } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');

// GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, role, status } = req.query;

    const filter = { ...req.branchFilter };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const s = buildSearchFilter(search, ['name', 'email', 'phone']);
      Object.assign(filter, s);
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').populate('branchId', 'name branchCode').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return paginatedResponse(res, users, getPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, ...req.branchFilter })
      .select('-password')
      .populate('organizationId', 'name companyCode')
      .populate('branchId', 'name branchCode city');
    if (!user) return errorResponse(res, 'User not found.', 404, 'USER_NOT_FOUND');
    return successResponse(res, 'User retrieved.', { user });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, organizationId, branchId } = req.body;

    // Assign org/branch from requester if not SUPER_ADMIN
    const orgId = req.user.role === 'SUPER_ADMIN' ? organizationId : req.user.organizationId;
    const brId = req.user.role === 'SUPER_ADMIN' ? branchId : req.user.branchId;

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'Email already registered.', 409, 'EMAIL_EXISTS');

    const user = await User.create({ name, email, password, phone, role, organizationId: orgId, branchId: brId });
    await auditFromReq(req, 'CREATE', 'User', user._id, null, { name, email, role });

    const userObj = user.toObject();
    delete userObj.password;
    return successResponse(res, 'User created successfully.', { user: userObj }, 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const oldUser = await User.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!oldUser) return errorResponse(res, 'User not found.', 404, 'USER_NOT_FOUND');

    const { name, phone, role, status, branchId } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (branchId && req.user.role === 'SUPER_ADMIN') updates.branchId = branchId;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    await auditFromReq(req, 'UPDATE', 'User', user._id, oldUser.toObject(), updates);
    return successResponse(res, 'User updated successfully.', { user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!user) return errorResponse(res, 'User not found.', 404);
    if (String(user._id) === String(req.user._id)) return errorResponse(res, 'Cannot delete your own account.', 400);
    await User.findByIdAndDelete(req.params.id);
    await auditFromReq(req, 'DELETE', 'User', req.params.id, user.toObject(), null);
    return successResponse(res, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};
