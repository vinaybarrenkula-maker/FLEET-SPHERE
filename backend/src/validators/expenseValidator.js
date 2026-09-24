const Joi = require('joi');

// ─── Create Expense Schema ─────────────────────────────────────────────────────
const createExpenseSchema = Joi.object({
  vehicleId: Joi.string().hex().length(24).optional().allow(null, '').messages({
    'string.length': 'Invalid Vehicle ID format',
  }),
  driverId: Joi.string().hex().length(24).optional().allow(null, '').messages({
    'string.length': 'Invalid Driver ID format',
  }),
  tripId: Joi.string().hex().length(24).optional().allow(null, '').messages({
    'string.length': 'Invalid Trip ID format',
  }),
  category: Joi.string()
    .valid('FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'DRIVER_ALLOWANCE', 'REPAIR', 'OTHER')
    .required()
    .messages({
      'any.only': 'Invalid category. Must be one of: FUEL, MAINTENANCE, TOLL, PARKING, DRIVER_ALLOWANCE, REPAIR, OTHER',
      'any.required': 'Expense category is required',
    }),
  amount: Joi.number().positive().precision(2).max(10000000).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'number.max': 'Amount seems unrealistically high',
    'any.required': 'Amount is required',
  }),
  date: Joi.date().max('now').optional().default(Date.now).messages({
    'date.max': 'Expense date cannot be in the future',
  }),
  description: Joi.string().trim().min(3).max(500).required().messages({
    'string.min': 'Description must be at least 3 characters',
    'any.required': 'Description is required',
  }),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
});

// ─── Review Expense Schema ─────────────────────────────────────────────────────
const reviewExpenseSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required().messages({
    'any.only': 'Status must be either APPROVED or REJECTED',
    'any.required': 'Review status is required',
  }),
  rejectionReason: Joi.when('status', {
    is: 'REJECTED',
    then: Joi.string().trim().min(5).max(500).required().messages({
      'string.min': 'Rejection reason must be at least 5 characters',
      'any.required': 'Rejection reason is required when rejecting an expense',
    }),
    otherwise: Joi.string().trim().max(500).optional().allow('', null),
  }),
});

module.exports = {
  createExpenseSchema,
  reviewExpenseSchema,
};
