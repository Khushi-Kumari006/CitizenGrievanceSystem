const { pool } = require('../config/database');

class Grievance {
  /**
   * Find grievance by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const query = `
      SELECT 
        g.id, g.grievance_number, g.citizen_id, u.name AS citizen_name, u.email AS citizen_email,
        g.title, g.description, g.category_id, gc.name AS category_name,
        g.department_id, d.name AS department_name,
        g.assigned_officer_id, off.name AS officer_name, off.email AS officer_email,
        g.priority, g.status, g.location, g.attachment_path,
        g.created_at, g.updated_at, g.resolved_at
      FROM grievances g
      INNER JOIN users u ON g.citizen_id = u.id
      INNER JOIN grievance_categories gc ON g.category_id = gc.id
      INNER JOIN departments d ON g.department_id = d.id
      LEFT JOIN users off ON g.assigned_officer_id = off.id
      WHERE g.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Find grievance by grievance_number
   * @param {string} grievanceNumber
   * @returns {Promise<Object|null>}
   */
  static async findByGrievanceNumber(grievanceNumber) {
    const query = `
      SELECT 
        g.id, g.grievance_number, g.citizen_id, u.name AS citizen_name, u.email AS citizen_email,
        g.title, g.description, g.category_id, gc.name AS category_name,
        g.department_id, d.name AS department_name,
        g.assigned_officer_id, off.name AS officer_name, off.email AS officer_email,
        g.priority, g.status, g.location, g.attachment_path,
        g.created_at, g.updated_at, g.resolved_at
      FROM grievances g
      INNER JOIN users u ON g.citizen_id = u.id
      INNER JOIN grievance_categories gc ON g.category_id = gc.id
      INNER JOIN departments d ON g.department_id = d.id
      LEFT JOIN users off ON g.assigned_officer_id = off.id
      WHERE g.grievance_number = ?
    `;
    const [rows] = await pool.execute(query, [grievanceNumber]);
    return rows[0] || null;
  }

  /**
   * Find all grievances with filters
   * @param {Object} [filters={}]
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        g.id, g.grievance_number, g.citizen_id, u.name AS citizen_name,
        g.title, g.description, g.category_id, gc.name AS category_name,
        g.department_id, d.name AS department_name,
        g.assigned_officer_id, off.name AS officer_name,
        g.priority, g.status, g.location, g.attachment_path,
        g.created_at, g.updated_at, g.resolved_at
      FROM grievances g
      INNER JOIN users u ON g.citizen_id = u.id
      INNER JOIN grievance_categories gc ON g.category_id = gc.id
      INNER JOIN departments d ON g.department_id = d.id
      LEFT JOIN users off ON g.assigned_officer_id = off.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.citizen_id) {
      query += ' AND g.citizen_id = ?';
      params.push(filters.citizen_id);
    }
    if (filters.department_id) {
      query += ' AND g.department_id = ?';
      params.push(filters.department_id);
    }
    if (filters.category_id) {
      query += ' AND g.category_id = ?';
      params.push(filters.category_id);
    }
    if (filters.assigned_officer_id) {
      query += ' AND g.assigned_officer_id = ?';
      params.push(filters.assigned_officer_id);
    }
    if (filters.status) {
      query += ' AND g.status = ?';
      params.push(filters.status);
    }
    if (filters.priority) {
      query += ' AND g.priority = ?';
      params.push(filters.priority);
    }
    if (filters.search) {
      query += ' AND (g.title LIKE ? OR g.grievance_number LIKE ? OR g.description LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY g.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Update grievance fields
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<boolean>}
   */
  static async update(id, updates) {
    const allowedFields = ['title', 'description', 'category_id', 'department_id', 'priority', 'location', 'attachment_path'];
    const setClauses = [];
    const params = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (setClauses.length === 0) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE grievances SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  /**
   * Create a new grievance
   * @param {Object} data
   * @returns {Promise<number>}
   */
  static async create({
    grievance_number,
    citizen_id,
    title,
    description,
    category_id,
    department_id,
    assigned_officer_id = null,
    priority = 'MEDIUM',
    status = 'SUBMITTED',
    location = null,
    attachment_path = null,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO grievances (
        grievance_number, citizen_id, title, description, category_id,
        department_id, assigned_officer_id, priority, status, location, attachment_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        grievance_number,
        citizen_id,
        title,
        description,
        category_id,
        department_id,
        assigned_officer_id,
        priority,
        status,
        location,
        attachment_path,
      ]
    );
    return result.insertId;
  }

  /**
   * Update grievance status
   * @param {number} id
   * @param {string} status
   * @param {Date|null} [resolvedAt=null]
   * @returns {Promise<boolean>}
   */
  static async updateStatus(id, status, resolvedAt = null) {
    const [result] = await pool.execute(
      'UPDATE grievances SET status = ?, resolved_at = ? WHERE id = ?',
      [status, resolvedAt, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Assign officer to grievance
   * @param {number} id
   * @param {number|null} officerId
   * @returns {Promise<boolean>}
   */
  static async assignOfficer(id, officerId) {
    const [result] = await pool.execute(
      'UPDATE grievances SET assigned_officer_id = ? WHERE id = ?',
      [officerId, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get grievance statistics summary
   * @param {Object} [filters={}]
   * @returns {Promise<Object>}
   */
  static async getStats(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.department_id) {
      whereClause += ' AND department_id = ?';
      params.push(filters.department_id);
    }
    if (filters.assigned_officer_id) {
      whereClause += ' AND assigned_officer_id = ?';
      params.push(filters.assigned_officer_id);
    }
    if (filters.citizen_id) {
      whereClause += ' AND citizen_id = ?';
      params.push(filters.citizen_id);
    }

    // Status counts
    const [statusRows] = await pool.execute(
      `SELECT status, COUNT(*) AS count FROM grievances ${whereClause} GROUP BY status`,
      params
    );

    // Priority counts
    const [priorityRows] = await pool.execute(
      `SELECT priority, COUNT(*) AS count FROM grievances ${whereClause} GROUP BY priority`,
      params
    );

    // Department counts
    const [deptRows] = await pool.execute(
      `SELECT d.id, d.name, COUNT(g.id) AS count
       FROM departments d
       LEFT JOIN grievances g ON d.id = g.department_id
       GROUP BY d.id, d.name
       ORDER BY count DESC`
    );

    // Total count
    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM grievances ${whereClause}`,
      params
    );

    const statusCounts = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
      CLOSED: 0,
    };
    statusRows.forEach((r) => {
      statusCounts[r.status] = parseInt(r.count, 10);
    });

    const priorityCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    priorityRows.forEach((r) => {
      priorityCounts[r.priority] = parseInt(r.count, 10);
    });

    return {
      total: parseInt(totalRows[0]?.total || 0, 10),
      byStatus: statusCounts,
      byPriority: priorityCounts,
      byDepartment: deptRows.map((r) => ({
        department_id: r.id,
        department_name: r.name,
        count: parseInt(r.count, 10),
      })),
    };
  }
}

module.exports = Grievance;
