const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * authenticate — verify JWT, attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided. Please log in.', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found. Token is invalid.', 401, 'USER_NOT_FOUND');
    }
    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Your account is not active. Contact administrator.', 403, 'ACCOUNT_INACTIVE');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401, 'INVALID_TOKEN');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    next(error);
  }
};

/**
 * authorizeRole — check user role
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401, 'AUTH_REQUIRED');
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
        403,
        'INSUFFICIENT_ROLE'
      );
    }
    next();
  };
};

/**
 * authorizeBranch — inject branch filter based on user's role and branch
 * SUPER_ADMIN: no filter (can see all)
 * FLEET_MANAGER: filter by organizationId only
 * BRANCH_MANAGER, DRIVER, FINANCE_OFFICER: filter by organizationId + branchId
 */
const authorizeBranch = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401, 'AUTH_REQUIRED');
  }

  switch (req.user.role) {
    case 'SUPER_ADMIN':
      req.branchFilter = {};
      break;
    case 'FLEET_MANAGER':
      req.branchFilter = { organizationId: req.user.organizationId };
      break;
    default:
      req.branchFilter = {
        organizationId: req.user.organizationId,
        branchId: req.user.branchId,
      };
  }

  // If a specific branchId is passed as query param, validate access
  if (req.query.branchId || req.body.branchId) {
    const requestedBranchId = req.query.branchId || req.body.branchId;
    if (
      req.user.role !== 'SUPER_ADMIN' &&
      req.user.role !== 'FLEET_MANAGER' &&
      requestedBranchId !== String(req.user.branchId)
    ) {
      return errorResponse(res, 'Access denied. You cannot access data from another branch.', 403, 'BRANCH_ACCESS_DENIED');
    }
  }

  next();
};

/**
 * optionalAuth — attach user if token present, but don't reject if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, authorizeRole, authorizeBranch, optionalAuth };
