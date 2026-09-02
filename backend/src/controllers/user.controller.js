const UserService = require('../services/user.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle GET /api/users/profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await UserService.getProfile(req.user.id);
    return successResponse(res, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PUT /api/users/profile
 */
async function updateProfile(req, res, next) {
  try {
    const user = await UserService.updateProfile(req.user.id, req.body);
    return successResponse(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PUT /api/users/change-password
 */
async function changePassword(req, res, next) {
  try {
    await UserService.changePassword(req.user.id, req.body);
    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/users (Admin only)
 */
async function getUsers(req, res, next) {
  try {
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.department_id) filters.department_id = parseInt(req.query.department_id, 10);
    if (req.query.active !== undefined) filters.active = req.query.active === 'true';

    const users = await UserService.getAllUsers(filters);
    return successResponse(res, 'Users retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/users/:id
 */
async function getUserById(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    // Allow user to view self or Admin to view any user
    if (req.user.role !== 'ADMIN' && req.user.id !== targetId) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    const user = await UserService.getUserById(targetId);
    return successResponse(res, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/users (Admin only)
 */
async function createUser(req, res, next) {
  try {
    const user = await UserService.createUser(req.body);
    return successResponse(res, 'User created successfully', { user }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PUT /api/users/:id (Admin only)
 */
async function updateUser(req, res, next) {
  try {
    const user = await UserService.updateUser(parseInt(req.params.id, 10), req.body);
    return successResponse(res, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  createUser,
  updateUser,
};
