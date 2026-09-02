const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/token');
const { ROLES } = require('../constants');

class AuthService {
  /**
   * Register a new citizen user
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} [userData.phone]
   * @returns {Promise<Object>} { user, token }
   */
  static async register({ name, email, password, phone = null }) {
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

    // Basic email format validation
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

    // Check for existing user with this email
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash password using bcrypt
    const hashedPassword = await hashPassword(password);

    // Enforce role CITIZEN for public registration (OFFICER and ADMIN are forbidden)
    const role = ROLES.CITIZEN;
    const cleanPhone = phone && typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : null;

    const newUserId = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role,
      department_id: null,
    });

    // Retrieve safe user record (no password)
    const user = await User.findById(newUserId);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Authenticate user with email and password
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<Object>} { user, token }
   */
  static async login({ email, password }) {
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      const error = new Error('Password is required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email (includes password hash for verification)
    const userWithPassword = await User.findByEmail(normalizedEmail);
    if (!userWithPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify bcrypt password
    const isPasswordValid = await comparePassword(password, userWithPassword.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check if account is active
    if (!userWithPassword.active) {
      const error = new Error('Your account is deactivated. Please contact administrator.');
      error.statusCode = 403;
      throw error;
    }

    // Safe user object (remove password hash)
    const safeUser = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      phone: userWithPassword.phone,
      role: userWithPassword.role,
      department_id: userWithPassword.department_id,
      active: Boolean(userWithPassword.active),
      created_at: userWithPassword.created_at,
      updated_at: userWithPassword.updated_at,
    };

    // Generate JWT token
    const token = generateToken({
      id: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Get safe user profile by ID
   * @param {number} userId
   * @returns {Promise<Object>} safe user profile
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.active) {
      const error = new Error('User account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    return user;
  }
}

module.exports = AuthService;
