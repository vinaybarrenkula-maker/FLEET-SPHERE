const Joi = require('joi');

// ─── Create Fuel Entry Schema ─────────────────────────────────────────────────
const createFuelEntrySchema = Joi.object({
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
  date: Joi.date().max('now').optional().default(Date.now).messages({
    'date.max': 'Fuel entry date cannot be in the future',
  }),
  fuelType: Joi.string().valid('DIESEL', 'PETROL', 'CNG', 'ELECTRIC').required().messages({
    'any.only': 'Invalid fuel type. Must be one of: DIESEL, PETROL, CNG, ELECTRIC',
    'any.required': 'Fuel type is required',
  }),
  quantity: Joi.number().min(0.1).max(10000).required().messages({
    'number.min': 'Quantity must be at least 0.1 liters',
    'number.max': 'Quantity seems unrealistically high',
    'any.required': 'Fuel quantity is required',
  }),
  pricePerUnit: Joi.number().min(0.01).max(500).required().messages({
    'number.min': 'Price per unit must be greater than 0',
    'number.max': 'Price per unit seems unrealistically high',
    'any.required': 'Price per unit is required',
  }),
  odometer: Joi.number().min(0).required().messages({
    'number.min': 'Odometer reading cannot be negative',
    'any.required': 'Odometer reading is required',
  }),
  fuelStation: Joi.string().trim().max(200).optional().allow('', null),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
});

module.exports = {
  createFuelEntrySchema,
};
