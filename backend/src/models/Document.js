const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch ID is required'],
    },
    entityType: {
      type: String,
      enum: ['VEHICLE', 'DRIVER', 'ORGANIZATION', 'BRANCH'],
      required: [true, 'Entity type is required'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      // Note: refPath cannot be used directly with enum strings that don't match model names exactly,
      // so we manage population manually in controllers via entityType
    },
    documentType: {
      type: String,
      enum: ['INSURANCE', 'RC', 'LICENSE', 'PERMIT', 'POLLUTION', 'INVOICE', 'FITNESS', 'OTHER'],
      required: [true, 'Document type is required'],
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    mimeType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Pre-save Hook: Check if document is expired ──────────────────────────────
documentSchema.pre('save', function (next) {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isExpired = true;
  } else {
    this.isExpired = false;
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
documentSchema.index({ organizationId: 1, branchId: 1 });
documentSchema.index({ entityType: 1 });
documentSchema.index({ entityId: 1 });
documentSchema.index({ expiryDate: 1 });
documentSchema.index({ entityId: 1, entityType: 1 });
documentSchema.index({ expiryDate: 1, isExpired: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
