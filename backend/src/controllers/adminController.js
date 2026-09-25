const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { auditFromReq } = require('../utils/auditLogger');

// GET /api/admin/users/pending
exports.getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: 'PENDING' })
      .select('-password')
      .sort({ createdAt: -1 });
    return successResponse(res, 'Pending users retrieved.', { users });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/approve
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found.', 404);
    if (user.status !== 'PENDING') return errorResponse(res, 'User is not pending approval.', 400);

    user.status = 'ACTIVE';
    user.rejectionReason = undefined;
    await user.save();

    await auditFromReq(req, 'UPDATE', 'User', user._id, { status: 'PENDING' }, { status: 'ACTIVE' });
    return successResponse(res, 'User approved successfully.');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/reject
exports.rejectUser = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found.', 404);
    if (user.status !== 'PENDING') return errorResponse(res, 'User is not pending approval.', 400);

    user.status = 'REJECTED';
    if (rejectionReason) {
      user.rejectionReason = rejectionReason;
    }
    await user.save();

    await auditFromReq(req, 'UPDATE', 'User', user._id, { status: 'PENDING' }, { status: 'REJECTED', rejectionReason });
    return successResponse(res, 'User registration rejected.');
  } catch (err) {
    next(err);
  }
};
