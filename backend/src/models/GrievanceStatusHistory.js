const { pool } = require('../config/database');

class GrievanceStatusHistory {
  /**
   * Find status history by grievance ID
   * @param {number} grievanceId
   * @returns {Promise<Array>}
   */
  static async findByGrievanceId(grievanceId) {
    const query = `
      SELECT 
        h.id, h.grievance_id, h.old_status, h.new_status,
        h.changed_by, u.name AS changed_by_name, u.role AS changed_by_role,
        h.remarks, h.created_at
      FROM grievance_status_history h
      INNER JOIN users u ON h.changed_by = u.id
      WHERE h.grievance_id = ?
      ORDER BY h.created_at ASC
    `;
    const [rows] = await pool.execute(query, [grievanceId]);
    return rows;
  }

  /**
   * Record a status transition
   * @param {Object} data
   * @returns {Promise<number>}
   */
  static async create({ grievance_id, old_status = null, new_status, changed_by, remarks = null }) {
    const [result] = await pool.execute(
      `INSERT INTO grievance_status_history (grievance_id, old_status, new_status, changed_by, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [grievance_id, old_status, new_status, changed_by, remarks]
    );
    return result.insertId;
  }
}

module.exports = GrievanceStatusHistory;
