const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
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
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
    },
    location: {
      address: String,
      city: String,
      state: String,
      coordinates: { lat: Number, lng: Number },
    },
    incidentType: {
      type: String,
      enum: ['ACCIDENT', 'BREAKDOWN', 'THEFT', 'TRAFFIC_VIOLATION', 'CARGO_DAMAGE', 'INJURY', 'OTHER'],
      required: [true, 'Incident type is required'],
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: [true, 'Severity is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    evidence: [
      {
        url: String,
        publicId: String,
        type: { type: String, enum: ['IMAGE', 'VIDEO', 'DOCUMENT'] },
        description: String,
      },
    ],
    investigationNotes: String,
    resolution: String,
    estimatedLoss: Number,
    insuranceClaimed: { type: Boolean, default: false },
    policeReport: String,
    status: {
      type: String,
      enum: ['REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'],
      default: 'REPORTED',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investigatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

incidentSchema.index({ organizationId: 1, branchId: 1 });
incidentSchema.index({ vehicleId: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ incidentDate: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
