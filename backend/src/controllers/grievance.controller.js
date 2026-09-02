const GrievanceService = require('../services/grievance.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Handle POST /api/grievances
 */
async function createGrievance(req, res, next) {
  try {
    const grievance = await GrievanceService.createGrievance(req.body, req.user);
    return successResponse(res, 'Grievance submitted successfully', { grievance }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/grievances
 */
async function getAllGrievances(req, res, next) {
  try {
    const grievances = await GrievanceService.getAllGrievances(req.query, req.user);
    return successResponse(res, 'Grievances retrieved successfully', { grievances });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/grievances/my
 */
async function getMyGrievances(req, res, next) {
  try {
    const grievances = await GrievanceService.getCitizenGrievances(req.user.id);
    return successResponse(res, 'My grievances retrieved successfully', { grievances });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/grievances/:id
 */
async function getGrievanceById(req, res, next) {
  try {
    const grievance = await GrievanceService.getGrievanceDetails(req.params.id, req.user);
    return successResponse(res, 'Grievance details retrieved successfully', { grievance });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PUT /api/grievances/:id
 */
async function updateGrievance(req, res, next) {
  try {
    const grievance = await GrievanceService.updateGrievance(parseInt(req.params.id, 10), req.body, req.user);
    return successResponse(res, 'Grievance updated successfully', { grievance });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PATCH /api/grievances/:id/status
 */
async function updateStatus(req, res, next) {
  try {
    const grievance = await GrievanceService.updateStatus(parseInt(req.params.id, 10), req.body, req.user);
    return successResponse(res, 'Grievance status updated successfully', { grievance });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle PATCH /api/grievances/:id/assign
 */
async function assignOfficer(req, res, next) {
  try {
    const { officer_id } = req.body;
    if (!officer_id) {
      const error = new Error('officer_id is required');
      error.statusCode = 400;
      throw error;
    }
    const grievance = await GrievanceService.assignOfficer(parseInt(req.params.id, 10), parseInt(officer_id, 10), req.user);
    return successResponse(res, 'Officer assigned successfully', { grievance });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle GET /api/grievances/:id/history
 */
async function getStatusHistory(req, res, next) {
  try {
    const details = await GrievanceService.getGrievanceDetails(req.params.id, req.user);
    return successResponse(res, 'Status history retrieved successfully', {
      grievance_id: details.id,
      grievance_number: details.grievance_number,
      history: details.status_history,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGrievance,
  getAllGrievances,
  getMyGrievances,
  getGrievanceById,
  updateGrievance,
  updateStatus,
  assignOfficer,
  getStatusHistory,
};
