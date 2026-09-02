const AdminService = require('../services/admin.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle GET /api/admin/dashboard
 */
async function getDashboard(req, res, next) {
  try {
    const dashboard = await AdminService.getAdminDashboard();
    return successResponse(res, 'Admin dashboard retrieved successfully', dashboard);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
};
