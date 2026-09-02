const HealthService = require('../services/health.service');

/**
 * Handle GET /api/health
 */
function getHealth(req, res, next) {
  try {
    const health = HealthService.getHealthStatus();
    res.status(200).json({
      success: true,
      message: health.message,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};
