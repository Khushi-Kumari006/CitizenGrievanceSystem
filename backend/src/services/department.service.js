const Department = require('../models/Department');

class DepartmentService {
  /**
   * Get all departments
   * @param {boolean} [onlyActive=false]
   * @returns {Promise<Array>}
   */
  static async getAllDepartments(onlyActive = false) {
    return Department.findAll(onlyActive);
  }

  /**
   * Get department by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async getDepartmentById(id) {
    const department = await Department.findById(id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }
    return department;
  }

  /**
   * Create department
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async createDepartment({ name, description = null, active = true }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const error = new Error('Department name is required');
      error.statusCode = 400;
      throw error;
    }

    const existing = await Department.findByName(name.trim());
    if (existing) {
      const error = new Error('A department with this name already exists');
      error.statusCode = 409;
      throw error;
    }

    const insertId = await Department.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      active: active !== undefined ? Boolean(active) : true,
    });

    return Department.findById(insertId);
  }

  /**
   * Update department
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async updateDepartment(id, updates) {
    const department = await Department.findById(id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      throw error;
    }

    if (updates.name && updates.name.trim() !== department.name) {
      const existing = await Department.findByName(updates.name.trim());
      if (existing && existing.id !== id) {
        const error = new Error('A department with this name already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description ? updates.description.trim() : null;
    if (updates.active !== undefined) payload.active = Boolean(updates.active);

    await Department.update(id, payload);
    return Department.findById(id);
  }
}

module.exports = DepartmentService;
