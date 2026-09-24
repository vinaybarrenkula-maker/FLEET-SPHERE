const mongoose = require('mongoose');

const fuelEntrySchema = new mongoose.Schema(
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
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    fuelType: {
      type: String,
      enum: ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'],
      required: [true, 'Fuel type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be positive'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price must be non-negative'],
    },
    totalCost: {
      type: Number,
    },
    odometer: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer must be non-negative'],
    },
    fuelStation: String,
    receipt: {
      url: String,
      publicId: String,
    },
    notes: String,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-calculate totalCost
fuelEntrySchema.pre('save', function (next) {
  if (this.quantity && this.pricePerUnit) {
    this.totalCost = Math.round(this.quantity * this.pricePerUnit * 100) / 100;
  }
  next();
});

fuelEntrySchema.index({ organizationId: 1, branchId: 1 });
fuelEntrySchema.index({ vehicleId: 1 });
fuelEntrySchema.index({ date: -1 });
fuelEntrySchema.index({ driverId: 1 });

module.exports = mongoose.model('FuelEntry', fuelEntrySchema);
