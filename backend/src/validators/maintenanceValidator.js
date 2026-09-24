const Joi = require('joi');

const vendorSchema = Joi.object({
  name: Joi.string().trim().max(200).optional().allow('', null),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'Vendor phone must be a valid 10-digit number',
    }),
  address: Joi.string().trim().max(500).optional().allow('', null),
});

const partSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required().messages({
    'any.required': 'Part name is required',
  }),
  quantity: Joi.number().integer().min(1).optional().default(1),
  cost: Joi.number().min(0).optional().default(0),
});

// ─── Create Maintenance Schema ─────────────────────────────────────────────────
const createMaintenanceSchema = Joi.object({
  vehicleId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Vehicle ID is required',
    'string.length': 'Invalid Vehicle ID format',
  }),
  serviceType: Joi.string()
    .valid(
      'OIL_CHANGE',
      'BRAKE_SERVICE',
      'TIRE_REPLACEMENT',
      'ENGINE_SERVICE',
      'GENERAL_SERVICE',
      'BATTERY_REPLACEMENT',
      'TRANSMISSION',
      'ELECTRICAL',
      'BODY_REPAIR',
      'OTHER'
    )
    .required()
    .messages({
      'any.only': 'Invalid service type',
      'any.required': 'Service type is required',
    }),
  description: Joi.string().trim().max(1000).optional().allow('', null),
  scheduledDate: Joi.date().optional().allow(null).messages({
    'date.base': 'Scheduled date must be a valid date',
  }),
  scheduledMileage: Joi.number().min(0).optional().allow(null),
  estimatedCost: Joi.number().min(0).optional().allow(null),
  vendor: vendorSchema.optional(),
  parts: Joi.array().items(partSchema).optional(),
  nextServiceDate: Joi.date().optional().allow(null),
  nextServiceMileage: Joi.number().min(0).optional().allow(null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
});

// ─── Update Maintenance Schema ─────────────────────────────────────────────────
const updateMaintenanceSchema = Joi.object({
  serviceType: Joi.string()
    .valid(
      'OIL_CHANGE',
      'BRAKE_SERVICE',
      'TIRE_REPLACEMENT',
      'ENGINE_SERVICE',
      'GENERAL_SERVICE',
      'BATTERY_REPLACEMENT',
      'TRANSMISSION',
      'ELECTRICAL',
      'BODY_REPAIR',
      'OTHER'
    )
    .optional(),
  description: Joi.string().trim().max(1000).optional().allow('', null),
  scheduledDate: Joi.date().optional().allow(null),
  completedDate: Joi.date().optional().allow(null),
  scheduledMileage: Joi.number().min(0).optional().allow(null),
  actualMileage: Joi.number().min(0).optional().allow(null),
  estimatedCost: Joi.number().min(0).optional().allow(null),
  actualCost: Joi.number().min(0).optional().allow(null),
  vendor: vendorSchema.optional(),
  status: Joi.string()
    .valid('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED')
    .optional()
    .messages({
      'any.only': 'Invalid maintenance status',
    }),
  parts: Joi.array().items(partSchema).optional(),
  nextServiceDate: Joi.date().optional().allow(null),
  nextServiceMileage: Joi.number().min(0).optional().allow(null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
  completedBy: Joi.string().hex().length(24).optional().allow(null, ''),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
};
