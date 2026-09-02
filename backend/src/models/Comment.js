const { pool } = require('../config/database');

class Comment {
  /**
   * Find comments by grievance ID
   * @param {number} grievanceId
   * @returns {Promise<Array>}
   */
  static async findByGrievanceId(grievanceId) {
    const query = `
      SELECT 
        c.id, c.grievance_id, c.user_id, u.name AS user_name, u.role AS user_role,
        c.message, c.created_at, c.updated_at
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.grievance_id = ?
      ORDER BY c.created_at ASC
    `;
    const [rows] = await pool.execute(query, [grievanceId]);
    return rows;
  }

  /**
   * Create a new comment
   * @param {Object} data
   * @returns {Promise<number>}
   */
  static async create({ grievance_id, user_id, message }) {
    const [result] = await pool.execute(
      'INSERT INTO comments (grievance_id, user_id, message) VALUES (?, ?, ?)',
      [grievance_id, user_id, message]
    );
    return result.insertId;
  }
}

module.exports = Comment;
