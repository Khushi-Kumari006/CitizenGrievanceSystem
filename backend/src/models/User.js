const { pool } = require('../config/database');

class User {
  /**
   * Find user by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, department_id, active, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, password, phone, role, department_id, active, created_at, updated_at
       FROM users
       WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find all users with optional filtering
   * @param {Object} [filters={}]
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.department_id, d.name AS department_name,
             u.active, u.created_at, u.updated_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      query += ' AND u.role = ?';
      params.push(filters.role);
    }
    if (filters.department_id) {
      query += ' AND u.department_id = ?';
      params.push(filters.department_id);
    }
    if (filters.active !== undefined) {
      query += ' AND u.active = ?';
      params.push(filters.active);
    }

    query += ' ORDER BY u.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Create a new user
   * @param {Object} userData
   * @returns {Promise<number>} Inserted user ID
   */
  static async create({ name, email, password, phone = null, role = 'CITIZEN', department_id = null }) {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, phone, role, department_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone, role, department_id]
    );
    return result.insertId;
  }

  /**
   * Update user details
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<boolean>}
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'phone', 'role', 'department_id', 'active', 'password'];
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
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  /**
   * Count users grouped by role
   * @returns {Promise<Object>} Role counts
   */
  static async countByRole() {
    const [rows] = await pool.execute(
      `SELECT role, COUNT(*) AS count
       FROM users
       GROUP BY role`
    );
    const counts = { CITIZEN: 0, OFFICER: 0, ADMIN: 0, total: 0 };
    rows.forEach(r => {
      counts[r.role] = parseInt(r.count, 10);
      counts.total += parseInt(r.count, 10);
    });
    return counts;
  }
}

module.exports = User;
