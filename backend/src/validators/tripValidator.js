const Joi = require('joi');

const cargoDetailsSchema = Joi.object({
  type: Joi.string().trim().max(100).optional().allow('', null),
  weight: Joi.number().min(0).optional().allow(null),
  volume: Joi.number().min(0).optional().allow(null),
  description: Joi.string().trim().max(500).optional().allow('', null),
  consignee: Joi.string().trim().max(200).optional().allow('', null),
  consignor: Joi.string().trim().max(200).optional().allow('', null),
});

const expenseItemSchema = Joi.object({
  category: Joi.string().trim().max(100).required(),
  amount: Joi.number().min(0).required(),
  description: Joi.string().trim().max(500).optional().allow('', null),
});

// ─── Create Trip Schema ───────────────────────────────────────────────────────
const createTripSchema = Joi.object({
  vehicleId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Vehicle ID is required',
    'string.length': 'Invalid Vehicle ID format',
  }),
  driverId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Driver ID is required',
    'string.length': 'Invalid Driver ID format',
  }),
  routeId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Route ID is required',
    'string.length': 'Invalid Route ID format',
  }),
  cargoDetails: cargoDetailsSchema.optional(),
  plannedStartTime: Joi.date().required().messages({
    'any.required': 'Planned start time is required',
    'date.base': 'Planned start time must be a valid date',
  }),
  expectedEndTime: Joi.date()
    .greater(Joi.ref('plannedStartTime'))
    .optional()
    .allow(null)
    .messages({
      'date.greater': 'Expected end time must be after planned start time',
    }),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
  expenses: Joi.array().items(expenseItemSchema).optional(),
});

// ─── Update Trip Schema ───────────────────────────────────────────────────────
const updateTripSchema = Joi.object({
  vehicleId: Joi.string().hex().length(24).optional(),
  driverId: Joi.string().hex().length(24).optional(),
  routeId: Joi.string().hex().length(24).optional(),
  cargoDetails: cargoDetailsSchema.optional(),
  plannedStartTime: Joi.date().optional(),
  actualStartTime: Joi.date().optional().allow(null),
  expectedEndTime: Joi.date().optional().allow(null),
  actualEndTime: Joi.date().optional().allow(null),
  startMileage: Joi.number().min(0).optional().allow(null),
  endMileage: Joi.number().min(Joi.ref('startMileage')).optional().allow(null).messages({
    'number.min': 'End mileage must be greater than start mileage',
  }),
  delayReason: Joi.string().trim().max(500).optional().allow('', null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
  expenses: Joi.array().items(expenseItemSchema).optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

// ─── Update Trip Status Schema ────────────────────────────────────────────────
const updateTripStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PLANNED', 'ASSIGNED', 'STARTED', 'DELAYED', 'COMPLETED', 'CANCELLED')
    .required()
    .messages({
      'any.only': 'Invalid trip status',
      'any.required': 'Status is required',
    }),
  reason: Joi.string().trim().max(500).optional().allow('', null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
  actualStartTime: Joi.date().optional().allow(null),
  actualEndTime: Joi.date().optional().allow(null),
  startMileage: Joi.number().min(0).optional().allow(null),
  endMileage: Joi.number().min(0).optional().allow(null),
});

module.exports = {
  createTripSchema,
  updateTripSchema,
  updateTripStatusSchema,
};
