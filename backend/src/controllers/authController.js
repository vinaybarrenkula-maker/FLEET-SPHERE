const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const { successResponse, errorResponse } = require('../utils/response');
const { auditFromReq } = require('../utils/auditLogger');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, organizationId: user.organizationId, branchId: user.branchId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// GET /api/auth/org-branches (Public helper for driver registration)
exports.getPublicOrgBranches = async (req, res, next) => {
  try {
    const organizations = await Organization.find({ status: 'ACTIVE' }).select('name companyCode');
    const branches = await Branch.find({ status: 'ACTIVE' }).select('name branchCode city organizationId');
    return successResponse(res, 'Organizations and branches retrieved.', { organizations, branches });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register-driver (Dedicated Driver Registration)
exports.registerDriver = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      employeeId,
      licenseNumber,
      licenseType,
      licenseExpiry,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      organizationId,
      branchId,
      profilePhoto,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return errorResponse(res, 'Full name, email, phone number, and password are required.', 400);
    }
    if (!employeeId || !licenseNumber || !licenseType || !licenseExpiry) {
      return errorResponse(res, 'Employee ID, License Number, Type, and Expiry Date are required.', 400);
    }
    if (!organizationId || !branchId) {
      return errorResponse(res, 'Organization and Branch selection are required.', 400);
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 'Email address is already registered.', 409, 'EMAIL_EXISTS');
    }

    // Check existing employeeId or licenseNumber
    const existingDriver = await Driver.findOne({
      $or: [
        { employeeId: employeeId.trim() },
        { licenseNumber: licenseNumber.trim().toUpperCase() },
      ],
    });
    if (existingDriver) {
      return errorResponse(
        res,
        'A driver with this Employee ID or License Number is already registered.',
        409,
        'DRIVER_EXISTS'
      );
    }

    // Automatically enforce role = 'DRIVER' (cannot be selected or overridden)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      role: 'DRIVER', // STRICTLY ENFORCED
      organizationId,
      branchId,
      profileImage: profilePhoto || undefined,
      status: 'PENDING',
    });

    const driver = await Driver.create({
      organizationId,
      branchId,
      userId: user._id,
      employeeId: employeeId.trim(),
      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseType,
      licenseExpiry: new Date(licenseExpiry),
      phone: phone.trim(),
      emergencyContact: {
        name: emergencyContactName ? emergencyContactName.trim() : '',
        phone: emergencyContactPhone ? emergencyContactPhone.trim() : '',
        relation: emergencyContactRelation ? emergencyContactRelation.trim() : '',
      },
      status: 'AVAILABLE',
    });

    await auditFromReq(req, 'CREATE', 'Driver', driver._id, null, {
      name: user.name,
      employeeId: driver.employeeId,
      email: user.email,
    });

    return successResponse(
      res,
      'Driver account created successfully. Please login to continue.',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        driverId: driver._id,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register (Public generic registration)
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return errorResponse(res, 'All fields are required.', 400);
    }

    const allowedRoles = ['FLEET_MANAGER', 'BRANCH_MANAGER', 'FINANCE_OFFICER', 'DRIVER'];
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, 'Invalid role selection.', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      role,
      status: 'PENDING',
    });

    return successResponse(
      res,
      'Registration submitted successfully. Your account is waiting for Super Admin approval.',
      {},
      201
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, selectedRole } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400, 'MISSING_FIELDS');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return errorResponse(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    
    if (user.status === 'PENDING') {
      return errorResponse(res, 'Your account is waiting for Super Admin approval.', 403, 'ACCOUNT_PENDING');
    }
    if (user.status === 'REJECTED') {
      return errorResponse(res, 'Your registration request was rejected. Please contact the administrator.', 403, 'ACCOUNT_REJECTED');
    }
    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Your account is inactive. Contact administrator.', 403, 'ACCOUNT_INACTIVE');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');

    // BACKEND SECURITY VERIFICATION:
    // Compare selectedRole with user's actual role in MongoDB
    if (selectedRole && selectedRole !== user.role) {
      return res.status(403).json({
        success: false,
        message: 'Selected role does not match your account.',
        errorCode: 'ROLE_MISMATCH',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    await auditFromReq(req, 'LOGIN', 'User', user._id, null, null);

    const userObj = user.toObject();
    delete userObj.password;
    return successResponse(res, 'Login successful.', { user: userObj, token });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organizationId', 'name companyCode logo')
      .populate('branchId', 'name branchCode city');
    return successResponse(res, 'User retrieved.', { user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect.', 400, 'WRONG_PASSWORD');

    user.password = newPassword;
    await user.save();
    return successResponse(res, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return successResponse(res, 'If that email is registered, a reset link has been sent.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 'Reset token generated.', {
      resetToken,
      note: 'In production this would be emailed. For demo: use this token.',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return errorResponse(res, 'Token is invalid or expired.', 400, 'INVALID_RESET_TOKEN');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return successResponse(res, 'Password reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    await auditFromReq(req, 'LOGOUT', 'User', req.user._id, null, null);
    return successResponse(res, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};
