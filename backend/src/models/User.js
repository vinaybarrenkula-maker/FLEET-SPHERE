const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER', 'DRIVER', 'FINANCE_OFFICER'],
      required: [true, 'Role is required'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    profileImage: {
      url: String,
      publicId: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    lastLogin: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ organizationId: 1, branchId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual: full profile
userSchema.virtual('displayRole').get(function () {
  const roleMap = {
    SUPER_ADMIN: 'Super Admin',
    FLEET_MANAGER: 'Fleet Manager',
    BRANCH_MANAGER: 'Branch Manager',
    DRIVER: 'Driver',
    FINANCE_OFFICER: 'Finance Officer',
  };
  return roleMap[this.role] || this.role;
});

module.exports = mongoose.model('User', userSchema);
