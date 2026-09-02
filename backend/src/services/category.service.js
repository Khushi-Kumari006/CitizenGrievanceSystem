const GrievanceCategory = require('../models/GrievanceCategory');

class CategoryService {
  /**
   * Get all grievance categories
   * @param {boolean} [onlyActive=false]
   * @returns {Promise<Array>}
   */
  static async getAllCategories(onlyActive = false) {
    return GrievanceCategory.findAll(onlyActive);
  }

  /**
   * Get category by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  static async getCategoryById(id) {
    const category = await GrievanceCategory.findById(id);
    if (!category) {
      const error = new Error('Grievance category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  /**
   * Create category
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async createCategory({ name, description = null, active = true }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const error = new Error('Category name is required');
      error.statusCode = 400;
      throw error;
    }

    const existing = await GrievanceCategory.findByName(name.trim());
    if (existing) {
      const error = new Error('A category with this name already exists');
      error.statusCode = 409;
      throw error;
    }

    const insertId = await GrievanceCategory.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      active: active !== undefined ? Boolean(active) : true,
    });

    return GrievanceCategory.findById(insertId);
  }

  /**
   * Update category
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  static async updateCategory(id, updates) {
    const category = await GrievanceCategory.findById(id);
    if (!category) {
      const error = new Error('Grievance category not found');
      error.statusCode = 404;
      throw error;
    }

    if (updates.name && updates.name.trim() !== category.name) {
      const existing = await GrievanceCategory.findByName(updates.name.trim());
      if (existing && existing.id !== id) {
        const error = new Error('A category with this name already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description ? updates.description.trim() : null;
    if (updates.active !== undefined) payload.active = Boolean(updates.active);

    await GrievanceCategory.update(id, payload);
    return GrievanceCategory.findById(id);
  }
}

module.exports = CategoryService;
