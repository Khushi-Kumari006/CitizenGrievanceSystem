const OfficerService = require('../services/officer.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle GET /api/officer/dashboard
 */
async function getDashboard(req, res, next) {
  try {
    const dashboard = await OfficerService.getOfficerDashboard(req.user);
    return successResponse(res, 'Officer dashboard retrieved successfully', dashboard);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/officer/grievances
 */
async function getAssignedGrievances(req, res, next) {
  try {
    const grievances = await OfficerService.getAssignedGrievances(req.user, req.query);
    return successResponse(res, 'Assigned grievances retrieved successfully', { grievances });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getAssignedGrievances,
};
