const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message || err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, messages.join('. '), 422, 'VALIDATION_ERROR');
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return errorResponse(res, `${field} '${value}' already exists.`, 409, 'DUPLICATE_KEY');
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }

  // Multer / File Upload Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File too large. Maximum size is 10MB.', 400, 'FILE_TOO_LARGE');
    }
    return errorResponse(res, `File upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
  }

  // File type error from cloudinary.js
  if (err.message && err.message.includes('File type')) {
    return errorResponse(res, err.message, 400, 'INVALID_FILE_TYPE');
  }

  // Custom application errors
  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode, err.errorCode);
  }

  // Default 500
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message || 'Internal Server Error';

  return errorResponse(res, message, 500, 'SERVER_ERROR');
};

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode = 400, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'AppError';
  }
}

module.exports = { errorHandler, AppError };
