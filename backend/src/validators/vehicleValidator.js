const Joi = require('joi');

const documentItemSchema = Joi.object({
  documentType: Joi.string().trim().optional(),
  fileUrl: Joi.string().uri().optional(),
  publicId: Joi.string().optional(),
  expiryDate: Joi.date().optional().allow(null),
  uploadedBy: Joi.string().hex().length(24).optional(),
});

// ─── Create Vehicle Schema ─────────────────────────────────────────────────────
const createVehicleSchema = Joi.object({
  registrationNumber: Joi.string().trim().uppercase().min(2).max(20).required().messages({
    'any.required': 'Registration number is required',
    'string.min': 'Registration number must be at least 2 characters',
  }),
  vehicleType: Joi.string()
    .valid('TRUCK', 'LORRY', 'MINI_TRUCK', 'PICKUP', 'TANKER', 'CONTAINER', 'BUS', 'VAN', 'TEMPO')
    .required()
    .messages({
      'any.only': 'Invalid vehicle type',
      'any.required': 'Vehicle type is required',
    }),
  manufacturer: Joi.string().trim().max(100).optional().allow('', null),
  model: Joi.string().trim().max(100).optional().allow('', null),
  year: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Year must be 1980 or later',
      'number.max': 'Year cannot be in the future',
    }),
  capacity: Joi.object({
    weight: Joi.number().min(0).optional(),
    volume: Joi.number().min(0).optional(),
    unit: Joi.string().trim().optional().default('tonnes'),
  }).optional(),
  fuelType: Joi.string().valid('DIESEL', 'PETROL', 'CNG', 'ELECTRIC').required().messages({
    'any.only': 'Invalid fuel type',
    'any.required': 'Fuel type is required',
  }),
  currentMileage: Joi.number().min(0).optional().default(0),
  insuranceNumber: Joi.string().trim().optional().allow('', null),
  insuranceExpiry: Joi.date().optional().allow(null),
  registrationExpiry: Joi.date().optional().allow(null),
  pollutionExpiry: Joi.date().optional().allow(null),
  purchaseDate: Joi.date().optional().allow(null),
  purchasePrice: Joi.number().min(0).optional().allow(null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
  documents: Joi.array().items(documentItemSchema).optional(),
});

// ─── Update Vehicle Schema ─────────────────────────────────────────────────────
const updateVehicleSchema = Joi.object({
  registrationNumber: Joi.string().trim().uppercase().min(2).max(20).optional(),
  vehicleType: Joi.string()
    .valid('TRUCK', 'LORRY', 'MINI_TRUCK', 'PICKUP', 'TANKER', 'CONTAINER', 'BUS', 'VAN', 'TEMPO')
    .optional(),
  manufacturer: Joi.string().trim().max(100).optional().allow('', null),
  model: Joi.string().trim().max(100).optional().allow('', null),
  year: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .optional()
    .allow(null),
  capacity: Joi.object({
    weight: Joi.number().min(0).optional(),
    volume: Joi.number().min(0).optional(),
    unit: Joi.string().trim().optional(),
  }).optional(),
  fuelType: Joi.string().valid('DIESEL', 'PETROL', 'CNG', 'ELECTRIC').optional(),
  currentMileage: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid('AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'MAINTENANCE', 'INACTIVE')
    .optional(),
  insuranceNumber: Joi.string().trim().optional().allow('', null),
  insuranceExpiry: Joi.date().optional().allow(null),
  registrationExpiry: Joi.date().optional().allow(null),
  pollutionExpiry: Joi.date().optional().allow(null),
  purchaseDate: Joi.date().optional().allow(null),
  purchasePrice: Joi.number().min(0).optional().allow(null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
};
