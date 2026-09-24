const Joi = require('joi');

// ─── Create Driver Schema ─────────────────────────────────────────────────────
const createDriverSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    'any.required': 'User ID is required',
    'string.length': 'Invalid User ID format',
  }),
  employeeId: Joi.string().trim().uppercase().min(2).max(20).required().messages({
    'any.required': 'Employee ID is required',
  }),
  licenseNumber: Joi.string().trim().uppercase().min(5).max(20).required().messages({
    'any.required': 'License number is required',
    'string.min': 'License number must be at least 5 characters',
  }),
  licenseType: Joi.string().valid('LMV', 'HMV', 'HGMV', 'MGV').required().messages({
    'any.only': 'Invalid license type. Must be one of: LMV, HMV, HGMV, MGV',
    'any.required': 'License type is required',
  }),
  licenseExpiry: Joi.date().greater('now').required().messages({
    'date.greater': 'License expiry date must be in the future',
    'any.required': 'License expiry date is required',
  }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian phone number',
      'any.required': 'Phone number is required',
    }),
  emergencyContact: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Emergency contact phone must be a valid 10-digit number',
      }),
    relation: Joi.string().trim().max(50).optional(),
  }).optional(),
  joiningDate: Joi.date().max('now').optional().allow(null).messages({
    'date.max': 'Joining date cannot be in the future',
  }),
  address: Joi.object({
    street: Joi.string().trim().optional().allow('', null),
    city: Joi.string().trim().optional().allow('', null),
    state: Joi.string().trim().optional().allow('', null),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .optional()
      .allow('', null)
      .messages({
        'string.pattern.base': 'Pincode must be a 6-digit number',
      }),
  }).optional(),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
});

// ─── Update Driver Schema ─────────────────────────────────────────────────────
const updateDriverSchema = Joi.object({
  licenseNumber: Joi.string().trim().uppercase().min(5).max(20).optional(),
  licenseType: Joi.string().valid('LMV', 'HMV', 'HGMV', 'MGV').optional().messages({
    'any.only': 'Invalid license type',
  }),
  licenseExpiry: Joi.date().optional().allow(null),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian phone number',
    }),
  emergencyContact: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional(),
    relation: Joi.string().trim().max(50).optional(),
  }).optional(),
  joiningDate: Joi.date().optional().allow(null),
  address: Joi.object({
    street: Joi.string().trim().optional().allow('', null),
    city: Joi.string().trim().optional().allow('', null),
    state: Joi.string().trim().optional().allow('', null),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .optional()
      .allow('', null),
  }).optional(),
  status: Joi.string()
    .valid('AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'ON_LEAVE', 'INACTIVE')
    .optional()
    .messages({
      'any.only': 'Invalid status',
    }),
  assignedVehicle: Joi.string().hex().length(24).optional().allow(null, ''),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

module.exports = {
  createDriverSchema,
  updateDriverSchema,
};
