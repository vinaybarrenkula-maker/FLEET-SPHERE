const { createAuditLog } = require('../utils/auditLogger');

/**
 * Middleware factory: Automatically create audit log after successful write operations.
 * Must be placed after the route handler completes (using res.on('finish')).
 *
 * @param {string} action - Audit action enum (CREATE, UPDATE, DELETE, ASSIGN, APPROVE, REJECT, UPLOAD, EXPORT)
 * @param {string} entity - Entity name string (e.g., 'Vehicle', 'Trip', 'Driver')
 * @returns {function} Express middleware
 */
const auditLog = (action, entity) => {
  return (req, res, next) => {
    // Capture original json method to intercept response data
    const originalJson = res.json.bind(res);
    let responseBody = null;

    res.json = function (body) {
      responseBody = body;
      return originalJson(body);
    };

    res.on('finish', async () => {
      try {
        // Only log successful write operations (2xx responses)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const user = req.user || {};

          let entityId = null;
          if (responseBody && responseBody.data) {
            entityId =
              responseBody.data._id ||
              responseBody.data.id ||
              (req.params && req.params.id) ||
              null;
          } else if (req.params && req.params.id) {
            entityId = req.params.id;
          }

          // Build newData from response
          const newData = responseBody && responseBody.data ? responseBody.data : null;

          // Build oldData from req if it was attached (e.g., by controller before update)
          const oldData = req.auditOldData || null;

          await createAuditLog({
            organizationId: user.organizationId || null,
            branchId: user.branchId || null,
            userId: user._id || null,
            userName: user.name || null,
            userRole: user.role || null,
            action,
            entity,
            entityId,
            oldData,
            newData,
            ipAddress: req.ip || req.connection.remoteAddress || null,
            userAgent: req.headers['user-agent'] || null,
          });
        }
      } catch (error) {
        // Audit logging failures must never crash the application
        console.error('AuditMiddleware logging error:', error.message);
      }
    });

    next();
  };
};

module.exports = { auditLog };
