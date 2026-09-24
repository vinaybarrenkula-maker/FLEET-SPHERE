const AuditLog = require('../models/AuditLog');
const { successResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { action, entity, userId, startDate, endDate } = req.query;
    const filter = { ...req.branchFilter };
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('userId', 'name email role').sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    return paginatedResponse(res, logs, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};
