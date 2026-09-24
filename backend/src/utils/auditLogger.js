const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({
  organizationId = null,
  branchId = null,
  userId = null,
  userName = null,
  userRole = null,
  action,
  entity,
  entityId = null,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await AuditLog.create({
      organizationId,
      branchId,
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      oldData,
      newData,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Never let audit logging break the main request
    console.error('AuditLog error:', err.message);
  }
};

const auditFromReq = (req, action, entity, entityId, oldData, newData) => {
  return createAuditLog({
    organizationId: req.user?.organizationId,
    branchId: req.user?.branchId,
    userId: req.user?._id,
    userName: req.user?.name,
    userRole: req.user?.role,
    action,
    entity,
    entityId,
    oldData,
    newData,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
  });
};

module.exports = { createAuditLog, auditFromReq };
