const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [200, 'Name too long'],
    },
    branchCode: {
      type: String,
      required: [true, 'Branch code is required'],
      uppercase: true,
      trim: true,
    },
    address: {
      street: String,
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      country: { type: String, default: 'India' },
      pincode: String,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactNumber: String,
    email: String,
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    operationalHours: {
      start: String,
      end: String,
      days: [String],
    },
  },
  { timestamps: true }
);

// Compound unique: branchCode must be unique within an organization
branchSchema.index({ organizationId: 1, branchCode: 1 }, { unique: true });
branchSchema.index({ organizationId: 1 });
branchSchema.index({ status: 1 });

module.exports = mongoose.model('Branch', branchSchema);
