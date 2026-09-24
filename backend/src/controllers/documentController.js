const Document = require('../models/Document');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMeta } = require('../utils/pagination');
const { auditFromReq } = require('../utils/auditLogger');

exports.getDocuments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { entityType, entityId, documentType } = req.query;
    const filter = { ...req.branchFilter };
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;
    if (documentType) filter.documentType = documentType;

    const now = new Date();
    await Document.updateMany({ ...req.branchFilter, expiryDate: { $lt: now }, isExpired: false }, { $set: { isExpired: true } });

    const [documents, total] = await Promise.all([
      Document.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Document.countDocuments(filter),
    ]);
    return paginatedResponse(res, documents, getPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded.', 400, 'NO_FILE');
    const orgId = req.user.role === 'SUPER_ADMIN' ? req.body.organizationId : req.user.organizationId;
    const branchId = ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(req.user.role) ? req.body.branchId : req.user.branchId;

    const doc = await Document.create({
      organizationId: orgId,
      branchId,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      documentType: req.body.documentType,
      title: req.body.title,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      expiryDate: req.body.expiryDate || null,
      notes: req.body.notes,
      uploadedBy: req.user._id,
    });
    await auditFromReq(req, 'UPLOAD', 'Document', doc._id, null, { documentType: doc.documentType, entityType: doc.entityType });
    return successResponse(res, 'Document uploaded successfully.', { document: doc }, 201);
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ...req.branchFilter });
    if (!doc) return errorResponse(res, 'Document not found.', 404);
    await deleteFromCloudinary(doc.publicId);
    await Document.findByIdAndDelete(req.params.id);
    await auditFromReq(req, 'DELETE', 'Document', req.params.id, doc.toObject(), null);
    return successResponse(res, 'Document deleted.');
  } catch (err) { next(err); }
};
