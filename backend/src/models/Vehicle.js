const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['TRUCK', 'LORRY', 'MINI_TRUCK', 'PICKUP', 'TANKER', 'CONTAINER', 'BUS', 'VAN', 'TEMPO'],
      required: [true, 'Vehicle type is required'],
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: [1990, 'Year must be after 1990'],
      max: [new Date().getFullYear() + 1, 'Invalid year'],
    },
    capacity: {
      weight: Number,      // in kg/tons
      volume: Number,      // in cubic meters
      unit: { type: String, default: 'tons' },
    },
    fuelType: {
      type: String,
      enum: ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'],
      required: [true, 'Fuel type is required'],
    },
    currentMileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'MAINTENANCE', 'INACTIVE'],
      default: 'AVAILABLE',
    },
    insuranceNumber: String,
    insuranceExpiry: Date,
    registrationExpiry: Date,
    pollutionExpiry: Date,
    fitnessExpiry: Date,
    purchaseDate: Date,
    purchasePrice: Number,
    color: String,
    chassisNumber: String,
    engineNumber: String,
    notes: String,
    documents: [
      {
        documentType: {
          type: String,
          enum: ['INSURANCE', 'RC', 'POLLUTION', 'FITNESS', 'PERMIT', 'OTHER'],
        },
        fileUrl: String,
        publicId: String,
        expiryDate: Date,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound unique: registration number per organization
vehicleSchema.index({ organizationId: 1, registrationNumber: 1 }, { unique: true });
vehicleSchema.index({ organizationId: 1, branchId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ insuranceExpiry: 1 });
vehicleSchema.index({ registrationExpiry: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
