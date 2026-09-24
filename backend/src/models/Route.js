const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
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
    routeCode: {
      type: String,
      required: [true, 'Route code is required'],
      uppercase: true,
      trim: true,
    },
    origin: {
      city: { type: String, required: true },
      state: String,
      address: String,
      coordinates: { lat: Number, lng: Number },
    },
    destination: {
      city: { type: String, required: true },
      state: String,
      address: String,
      coordinates: { lat: Number, lng: Number },
    },
    stops: [
      {
        city: String,
        state: String,
        address: String,
        order: Number,
        coordinates: { lat: Number, lng: Number },
      },
    ],
    distance: {
      type: Number,
      required: [true, 'Distance in km is required'],
      min: [1, 'Distance must be at least 1 km'],
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration in minutes is required'],
    },
    routeType: {
      type: String,
      enum: ['LOCAL', 'INTERSTATE', 'INTRACITY', 'INTERNATIONAL'],
      default: 'LOCAL',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

routeSchema.index({ organizationId: 1, routeCode: 1 }, { unique: true });
routeSchema.index({ organizationId: 1, branchId: 1 });
routeSchema.index({ status: 1 });

module.exports = mongoose.model('Route', routeSchema);
