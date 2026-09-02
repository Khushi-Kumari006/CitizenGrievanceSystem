const { pool } = require('../config/database');

class Department {
  /**
   * Find all departments
   * @param {boolean} [onlyActive=false]
   * @returns {Promise<Array>}
   */
  static async findAll(onlyActive = false) {
    let query = 'SELECT id, name, description, active, created_at, updated_at FROM departments';
    const params = [];
    if (onlyActive) {
      query += ' WHERE active = ?';
      params.push(true);
    }
    query += ' ORDER BY name ASC';
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Find department by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, description, active, created_at, updated_at FROM departments WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find department by Name
   * @param {string} name
   * @returns {Promise<Object|null>}
   */
  static async findByName(name) {
    const [rows] = await pool.execute(
      'SELECT id, name, description, active, created_at, updated_at FROM departments WHERE name = ?',
      [name]
    );
    return rows[0] || null;
  }

  /**
   * Create a new department
   * @param {Object} data
   * @returns {Promise<number>}
   */
  static async create({ name, description = null, active = true }) {
    const [result] = await pool.execute(
      'INSERT INTO departments (name, description, active) VALUES (?, ?, ?)',
      [name, description, active]
    );
    return result.insertId;
  }

  /**
   * Update department
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<boolean>}
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'description', 'active'];
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
      `UPDATE departments SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }
}

module.exports = Department;
