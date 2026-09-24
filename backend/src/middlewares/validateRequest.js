const { errorResponse } = require('../utils/response');

/**
 * Middleware factory: Validates request body/params/query using a Joi schema.
 * Strips unknown fields and returns detailed validation error messages.
 *
 * @param {object} schema - Joi schema object
 * @param {string} source - Request property to validate: 'body' | 'query' | 'params' (default: 'body')
 * @returns {function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,   // Collect ALL errors, not just the first
      stripUnknown: true,  // Remove fields not in schema
      convert: true,       // Auto-convert strings to numbers, booleans etc.
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message.replace(/['"]/g, ''));
      return errorResponse(
        res,
        `Validation error: ${errorMessages.join('; ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }

    // Replace req[source] with the sanitized value
    req[source] = value;
    next();
  };
};

module.exports = { validate };
