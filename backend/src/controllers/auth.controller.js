const AuthService = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const result = await AuthService.register({ name, email, password, phone });
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    return successResponse(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await AuthService.getCurrentUser(req.user.id);
    return successResponse(res, 'User profile retrieved successfully', { user }, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
