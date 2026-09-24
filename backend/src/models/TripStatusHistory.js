const mongoose = require('mongoose');

const tripStatusHistorySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  previousStatus: String,
  newStatus: {
    type: String,
    required: true,
    enum: ['PLANNED', 'ASSIGNED', 'STARTED', 'DELAYED', 'COMPLETED', 'CANCELLED'],
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: String,
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

tripStatusHistorySchema.index({ tripId: 1, timestamp: 1 });

module.exports = mongoose.model('TripStatusHistory', tripStatusHistorySchema);
