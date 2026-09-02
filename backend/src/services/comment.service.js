const Comment = require('../models/Comment');
const Grievance = require('../models/Grievance');
const { ROLES } = require('../constants');

class CommentService {
  /**
   * Add comment to a grievance
   * @param {number} grievanceId
   * @param {Object} data - { message }
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created comment
   */
  static async addComment(grievanceId, { message }, user) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      const error = new Error('Comment message is required');
      error.statusCode = 400;
      throw error;
    }

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      const error = new Error('Grievance not found');
      error.statusCode = 404;
      throw error;
    }

    // Role-based access validation
    if (user.role === ROLES.CITIZEN && grievance.citizen_id !== user.id) {
      const error = new Error('You do not have permission to comment on this grievance');
      error.statusCode = 403;
      throw error;
    }

    const insertId = await Comment.create({
      grievance_id: grievanceId,
      user_id: user.id,
      message: message.trim(),
    });

    const comments = await Comment.findByGrievanceId(grievanceId);
    return comments.find((c) => c.id === insertId) || { id: insertId, grievance_id: grievanceId, user_id: user.id, message: message.trim() };
  }

  /**
   * Get all comments for a grievance
   * @param {number} grievanceId
   * @param {Object} user
   * @returns {Promise<Array>}
   */
  static async getCommentsByGrievanceId(grievanceId, user) {
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      const error = new Error('Grievance not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === ROLES.CITIZEN && grievance.citizen_id !== user.id) {
      const error = new Error('You do not have permission to view comments for this grievance');
      error.statusCode = 403;
      throw error;
    }

    return Comment.findByGrievanceId(grievanceId);
  }
}

module.exports = CommentService;
