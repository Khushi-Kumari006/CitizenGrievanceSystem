const Grievance = require('../models/Grievance');
const { STATUSES } = require('../constants');

class OfficerService {
  /**
   * Get officer dashboard statistics and assigned tasks
   * @param {Object} officer - Authenticated officer user
   * @returns {Promise<Object>}
   */
  static async getOfficerDashboard(officer) {
    const stats = await Grievance.getStats({ assigned_officer_id: officer.id });
    const recentGrievances = await Grievance.findAll({
      assigned_officer_id: officer.id,
    });

    return {
      officer: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        department_id: officer.department_id,
      },
      stats: {
        total_assigned: stats.total,
        in_progress: stats.byStatus[STATUSES.IN_PROGRESS] || 0,
        resolved: stats.byStatus[STATUSES.RESOLVED] || 0,
        under_review: stats.byStatus[STATUSES.UNDER_REVIEW] || 0,
        assigned_pending: stats.byStatus[STATUSES.ASSIGNED] || 0,
        by_priority: stats.byPriority,
      },
      recent_assigned: recentGrievances.slice(0, 5),
    };
  }

  /**
   * Get all grievances assigned to the officer
   * @param {Object} officer
   * @param {Object} query
   * @returns {Promise<Array>}
   */
  static async getAssignedGrievances(officer, query = {}) {
    return Grievance.findAll({
      ...query,
      assigned_officer_id: officer.id,
    });
  }
}

module.exports = OfficerService;
