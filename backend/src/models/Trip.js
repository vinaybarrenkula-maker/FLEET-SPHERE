const mongoose = require('mongoose');

const generateTripNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TRP-${year}-${random}`;
};

const tripSchema = new mongoose.Schema(
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
    tripNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route is required'],
    },
    cargoDetails: {
      type: String,
      weight: Number,
      volume: Number,
      description: String,
      consignee: String,
      consignor: String,
      invoiceNumber: String,
    },
    plannedStartTime: {
      type: Date,
      required: [true, 'Planned start time is required'],
    },
    actualStartTime: Date,
    expectedEndTime: Date,
    actualEndTime: Date,
    startMileage: Number,
    endMileage: Number,
    totalDistance: Number,
    status: {
      type: String,
      enum: ['PLANNED', 'ASSIGNED', 'STARTED', 'DELAYED', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
    },
    delayReason: String,
    cancellationReason: String,
    notes: String,
    totalExpenses: {
      type: Number,
      default: 0,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate trip number before save
tripSchema.pre('save', function (next) {
  if (!this.tripNumber) {
    this.tripNumber = generateTripNumber();
  }
  if (this.startMileage && this.endMileage) {
    this.totalDistance = this.endMileage - this.startMileage;
  }
  next();
});

tripSchema.index({ organizationId: 1, branchId: 1 });
tripSchema.index({ vehicleId: 1, status: 1 });
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ plannedStartTime: 1 });
// tripSchema.index({ tripNumber: 1 }); // Removed duplicate index

module.exports = mongoose.model('Trip', tripSchema);
