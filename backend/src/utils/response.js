// Standard API response helpers

const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 400, errorCode = null) => {
  const response = { success: false, message };
  if (errorCode) response.errorCode = errorCode;
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
