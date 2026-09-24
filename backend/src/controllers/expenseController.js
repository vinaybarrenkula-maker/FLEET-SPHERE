const Expense = require('../models/Expense');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');
const { sendNotificationToUser } = require('../utils/notifications');
const { exportToCSV, expenseCSVHeaders } = require('../utils/csvExport');
const Driver = require('../models/Driver');

exports.getExpenses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, category, vehicleId, startDate, endDate } = req.query;
    const filter = { ...req.branchFilter };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (req.user.role === 'DRIVER') {
      filter.submittedBy = req.user._id;
    }

    if (req.query.export === 'csv') {
      const all = await Expense.find(filter).populate('submittedBy', 'name').populate('vehicleId', 'registrationNumber').populate('tripId', 'tripNumber').lean();
      const data = all.map(e => ({
        date: new Date(e.date).toLocaleDateString('en-IN'),
        category: e.category,
        amount: e.amount,
        description: e.description,
        submittedBy: e.submittedBy?.name || '',
        status: e.status,
        vehicleReg: e.vehicleId?.registrationNumber || '',
        tripNumber: e.tripId?.tripNumber || '',
      }));
      return exportToCSV(res, data, expenseCSVHeaders, 'expenses');
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('submittedBy', 'name role')
        .populate('approvedBy', 'name')
        .populate('vehicleId', 'registrationNumber')
        .populate('tripId', 'tripNumber')
        .sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(filter),
    ]);
    return paginatedResponse(res, expenses, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, ...req.branchFilter })
      .populate('submittedBy', 'name role')
      .populate('approvedBy', 'name')
      .populate('vehicleId', 'registrationNumber')
      .populate('tripId', 'tripNumber');
    if (!expense) return errorResponse(res, 'Expense not found.', 404);
    return successResponse(res, 'Expense retrieved.', { expense });
  } catch (err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;
    const expense = await Expense.create({ ...req.body, organizationId: orgId, branchId, submittedBy: req.user._id, status: 'PENDING' });
    await auditFromReq(req, 'CREATE', 'Expense', expense._id, null, { category: expense.category, amount: expense.amount });
    return successResponse(res, 'Expense submitted successfully.', { expense }, 201);
  } catch (err) { next(err); }
};

exports.approveExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!expense) return errorResponse(res, 'Expense not found.', 404);
    if (expense.status !== 'PENDING') return errorResponse(res, 'Only pending expenses can be approved.', 409);

    expense.status = 'APPROVED';
    expense.approvedBy = req.user._id;
    expense.reviewedAt = new Date();
    await expense.save();

    await sendNotificationToUser(expense.submittedBy, expense.organizationId, expense.branchId, {
      notificationType: 'EXPENSE_APPROVED',
      title: 'Expense Approved',
      message: `Your expense of ₹${expense.amount} (${expense.category}) has been approved.`,
      relatedEntity: { entityType: 'Expense', entityId: expense._id },
    });
    await auditFromReq(req, 'APPROVE', 'Expense', expense._id, { status: 'PENDING' }, { status: 'APPROVED' });
    return successResponse(res, 'Expense approved.', { expense });
  } catch (err) { next(err); }
};

exports.rejectExpense = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return errorResponse(res, 'Rejection reason is required.', 400);

    const expense = await Expense.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!expense) return errorResponse(res, 'Expense not found.', 404);
    if (expense.status !== 'PENDING') return errorResponse(res, 'Only pending expenses can be rejected.', 409);

    expense.status = 'REJECTED';
    expense.approvedBy = req.user._id;
    expense.rejectionReason = rejectionReason;
    expense.reviewedAt = new Date();
    await expense.save();

    await sendNotificationToUser(expense.submittedBy, expense.organizationId, expense.branchId, {
      notificationType: 'EXPENSE_REJECTED',
      title: 'Expense Rejected',
      message: `Your expense of ₹${expense.amount} has been rejected. Reason: ${rejectionReason}`,
      relatedEntity: { entityType: 'Expense', entityId: expense._id },
    });
    await auditFromReq(req, 'REJECT', 'Expense', expense._id, { status: 'PENDING' }, { status: 'REJECTED', rejectionReason });
    return successResponse(res, 'Expense rejected.', { expense });
  } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, ...req.branchFilter });
    if (!expense) return errorResponse(res, 'Expense not found.', 404);
    await auditFromReq(req, 'DELETE', 'Expense', req.params.id, expense.toObject(), null);
    return successResponse(res, 'Expense deleted.');
  } catch (err) { next(err); }
};
