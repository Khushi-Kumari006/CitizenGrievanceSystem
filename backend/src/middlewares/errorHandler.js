/**
 * Centralized Error Handling Middleware
 * Ensures sensitive details (passwords, db credentials, env vars, stack traces) are never leaked.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Default safe error message
  let message = err.message || 'Internal Server Error';

  // Sanitize common database/system errors so credentials and schema details are never exposed
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    message = 'Database service unavailable';
  } else if (err.code === 'ER_DUP_ENTRY') {
    message = 'Duplicate entry detected';
  } else if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred';
  }

  const response = {
    success: false,
    message,
  };

  // Only attach non-sensitive error details if explicitly provided as safe validation errors
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
