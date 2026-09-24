const Joi = require('joi');

const locationSchema = Joi.object({
  address: Joi.string().trim().max(500).optional().allow('', null),
  city: Joi.string().trim().max(100).optional().allow('', null),
  state: Joi.string().trim().max(100).optional().allow('', null),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
  }).optional(),
});

// ─── Create Incident Schema ───────────────────────────────────────────────────
const createIncidentSchema = Joi.object({
  vehicleId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Vehicle ID is required',
    'string.length': 'Invalid Vehicle ID format',
  }),
  driverId: Joi.string().hex().length(24).optional().allow(null, '').messages({
    'string.length': 'Invalid Driver ID format',
  }),
  tripId: Joi.string().hex().length(24).optional().allow(null, '').messages({
    'string.length': 'Invalid Trip ID format',
  }),
  incidentDate: Joi.date().max('now').required().messages({
    'date.max': 'Incident date cannot be in the future',
    'any.required': 'Incident date is required',
  }),
  location: locationSchema.optional(),
  incidentType: Joi.string()
    .valid('ACCIDENT', 'BREAKDOWN', 'THEFT', 'TRAFFIC_VIOLATION', 'CARGO_DAMAGE', 'INJURY', 'OTHER')
    .required()
    .messages({
      'any.only': 'Invalid incident type',
      'any.required': 'Incident type is required',
    }),
  severity: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    .required()
    .messages({
      'any.only': 'Invalid severity. Must be one of: LOW, MEDIUM, HIGH, CRITICAL',
      'any.required': 'Severity is required',
    }),
  description: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required',
  }),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
});

// ─── Update Incident Schema ───────────────────────────────────────────────────
const updateIncidentSchema = Joi.object({
  incidentDate: Joi.date().max('now').optional(),
  location: locationSchema.optional(),
  incidentType: Joi.string()
    .valid('ACCIDENT', 'BREAKDOWN', 'THEFT', 'TRAFFIC_VIOLATION', 'CARGO_DAMAGE', 'INJURY', 'OTHER')
    .optional(),
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  description: Joi.string().trim().min(10).max(2000).optional(),
  investigationNotes: Joi.string().trim().max(2000).optional().allow('', null),
  resolution: Joi.string().trim().max(2000).optional().allow('', null),
  status: Joi.string()
    .valid('REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED')
    .optional()
    .messages({
      'any.only': 'Invalid status',
    }),
  investigatedBy: Joi.string().hex().length(24).optional().allow(null, ''),
  resolvedBy: Joi.string().hex().length(24).optional().allow(null, ''),
  resolvedAt: Joi.date().optional().allow(null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

module.exports = {
  createIncidentSchema,
  updateIncidentSchema,
};
