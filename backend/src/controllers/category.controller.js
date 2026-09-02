const CategoryService = require('../services/category.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle GET /api/categories
 */
async function getCategories(req, res, next) {
  try {
    const onlyActive = req.query.active === 'true';
    const categories = await CategoryService.getAllCategories(onlyActive);
    return successResponse(res, 'Grievance categories retrieved successfully', { categories });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/categories/:id
 */
async function getCategoryById(req, res, next) {
  try {
    const category = await CategoryService.getCategoryById(parseInt(req.params.id, 10));
    return successResponse(res, 'Grievance category retrieved successfully', { category });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/categories (Admin only)
 */
async function createCategory(req, res, next) {
  try {
    const category = await CategoryService.createCategory(req.body);
    return successResponse(res, 'Grievance category created successfully', { category }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PUT /api/categories/:id (Admin only)
 */
async function updateCategory(req, res, next) {
  try {
    const category = await CategoryService.updateCategory(parseInt(req.params.id, 10), req.body);
    return successResponse(res, 'Grievance category updated successfully', { category });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
};
