/**
 * Health check service
 */
class HealthService {
  static getHealthStatus() {
    return {
      message: 'Citizen Grievance Backend is running',
    };
  }
}

module.exports = HealthService;
