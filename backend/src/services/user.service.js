const User = require('../models/User');
const Department = require('../models/Department');
const { hashPassword, comparePassword } = require('../utils/password');
const { ROLES } = require('../constants');

class UserService {
  /**
   * Get user profile by ID
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Update current user profile
   * @param {number} userId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async updateProfile(userId, { name, phone }) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updates = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        const error = new Error('Name cannot be empty');
        error.statusCode = 400;
        throw error;
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = phone && typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : null;
    }

    if (Object.keys(updates).length > 0) {
      await User.update(userId, updates);
    }

    return User.findById(userId);
  }

  /**
   * Change user password
   * @param {number} userId
   * @param {Object} data
   * @returns {Promise<boolean>}
   */
  static async changePassword(userId, { oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) {
      const error = new Error('Current password and new password are required');
      error.statusCode = 400;
      throw error;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const userWithPassword = await User.findByEmail(user.email);
    const isMatch = await comparePassword(oldPassword, userWithPassword.password);
    if (!isMatch) {
      const error = new Error('Incorrect current password');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.update(userId, { password: hashedPassword });
    return true;
  }

  /**
   * Get all users (Admin only)
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async getAllUsers(filters = {}) {
    return User.findAll(filters);
  }

  /**
   * Get user by ID (Admin or Self)
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Admin create user (Officer, Admin, or Citizen)
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async createUser({ name, email, password, phone = null, role = ROLES.CITIZEN, department_id = null }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const error = new Error('Name is required');
      error.statusCode = 400;
      throw error;
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      const error = new Error('Please provide a valid email address');
      error.statusCode = 400;
      throw error;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    if (!Object.values(ROLES).includes(role)) {
      const error = new Error(`Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Check if email is already taken
    const existing = await User.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error('A user with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // If department_id is supplied, check department exists
    if (department_id) {
      const dept = await Department.findById(department_id);
      if (!dept) {
        const error = new Error('Specified department does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    const hashedPassword = await hashPassword(password);
    const insertId = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      role,
      department_id: role === ROLES.OFFICER ? department_id : null,
    });

    return User.findById(insertId);
  }

  /**
   * Admin update user
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async updateUser(id, updates) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone ? updates.phone.trim() : null;
    if (updates.active !== undefined) payload.active = Boolean(updates.active);

    if (updates.role !== undefined) {
      if (!Object.values(ROLES).includes(updates.role)) {
        const error = new Error(`Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      payload.role = updates.role;
    }

    if (updates.department_id !== undefined) {
      if (updates.department_id !== null) {
        const dept = await Department.findById(updates.department_id);
        if (!dept) {
          const error = new Error('Specified department does not exist');
          error.statusCode = 400;
          throw error;
        }
      }
      payload.department_id = updates.department_id;
    }

    if (updates.password !== undefined && updates.password.length >= 6) {
      payload.password = await hashPassword(updates.password);
    }

    await User.update(id, payload);
    return User.findById(id);
  }
}

module.exports = UserService;
