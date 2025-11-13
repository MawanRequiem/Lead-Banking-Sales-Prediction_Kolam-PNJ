function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function errorResponse(res, message = 'Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

function validationErrorResponse(res, validationErrors) {
  const errors = validationErrors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return res.status(422).json({
    success: false,
    message: 'Validation Error',
    errors,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
};
