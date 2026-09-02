const { verifyToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Authentication middleware
 * Validates JWT token from Authorization header and attaches authenticated user to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Access denied. No authentication token provided.');
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      const error = new Error('Access denied. Invalid token format.');
      error.statusCode = 401;
      return next(error);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      const error = new Error('Invalid or expired authentication token.');
      error.statusCode = 401;
      return next(error);
    }

    if (!decoded || !decoded.id) {
      const error = new Error('Invalid token payload.');
      error.statusCode = 401;
      return next(error);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error('User associated with this token no longer exists.');
      error.statusCode = 401;
      return next(error);
    }

    if (!user.active) {
      const error = new Error('User account is deactivated. Please contact support.');
      error.statusCode = 403;
      return next(error);
    }

    // Attach safe user object to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - List of permitted roles (e.g. 'CITIZEN', 'OFFICER', 'ADMIN')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error('Forbidden: You do not have permission to access this resource.');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
