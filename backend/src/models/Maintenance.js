const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    serviceType: {
      type: String,
      enum: [
        'OIL_CHANGE',
        'BRAKE_SERVICE',
        'TIRE_REPLACEMENT',
        'ENGINE_SERVICE',
        'GENERAL_SERVICE',
        'BATTERY_REPLACEMENT',
        'TRANSMISSION',
        'ELECTRICAL',
        'BODY_REPAIR',
        'AC_SERVICE',
        'WHEEL_ALIGNMENT',
        'OTHER',
      ],
      required: [true, 'Service type is required'],
    },
    description: String,
    scheduledDate: Date,
    completedDate: Date,
    scheduledMileage: Number,
    actualMileage: Number,
    estimatedCost: Number,
    actualCost: Number,
    vendor: {
      name: String,
      phone: String,
      address: String,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    parts: [
      {
        name: String,
        quantity: Number,
        unitCost: Number,
        totalCost: Number,
      },
    ],
    invoice: {
      url: String,
      publicId: String,
    },
    nextServiceDate: Date,
    nextServiceMileage: Number,
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

maintenanceSchema.index({ organizationId: 1, branchId: 1 });
maintenanceSchema.index({ vehicleId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
