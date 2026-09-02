const DepartmentService = require('../services/department.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle GET /api/departments
 */
async function getDepartments(req, res, next) {
  try {
    const onlyActive = req.query.active === 'true';
    const departments = await DepartmentService.getAllDepartments(onlyActive);
    return successResponse(res, 'Departments retrieved successfully', { departments });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/departments/:id
 */
async function getDepartmentById(req, res, next) {
  try {
    const department = await DepartmentService.getDepartmentById(parseInt(req.params.id, 10));
    return successResponse(res, 'Department retrieved successfully', { department });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle POST /api/departments (Admin only)
 */
async function createDepartment(req, res, next) {
  try {
    const department = await DepartmentService.createDepartment(req.body);
    return successResponse(res, 'Department created successfully', { department }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PUT /api/departments/:id (Admin only)
 */
async function updateDepartment(req, res, next) {
  try {
    const department = await DepartmentService.updateDepartment(parseInt(req.params.id, 10), req.body);
    return successResponse(res, 'Department updated successfully', { department });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
};
