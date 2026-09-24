const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    notificationType: {
      type: String,
      enum: [
        'MAINTENANCE_DUE',
        'MAINTENANCE_OVERDUE',
        'INSURANCE_EXPIRY',
        'LICENSE_EXPIRY',
        'TRIP_ASSIGNED',
        'TRIP_DELAYED',
        'INCIDENT_REPORTED',
        'EXPENSE_APPROVED',
        'EXPENSE_REJECTED',
        'DOCUMENT_EXPIRY',
        'GENERAL',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Vehicle', 'Driver', 'Trip', 'Maintenance', 'Incident', 'Expense', 'Document', 'FuelEntry'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
notificationSchema.index({ userId: 1 });
notificationSchema.index({ organizationId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
