const Grievance = require('../models/Grievance');
const User = require('../models/User');
const Department = require('../models/Department');
const GrievanceCategory = require('../models/GrievanceCategory');

class AdminService {
  /**
   * Get administrative dashboard metrics and system analytics
   * @returns {Promise<Object>}
   */
  static async getAdminDashboard() {
    const [grievanceStats, userStats, departments, categories, recentGrievances] = await Promise.all([
      Grievance.getStats(),
      User.countByRole(),
      Department.findAll(false),
      GrievanceCategory.findAll(false),
      Grievance.findAll({}),
    ]);

    return {
      overview: {
        total_grievances: grievanceStats.total,
        total_users: userStats.total,
        total_citizens: userStats.CITIZEN,
        total_officers: userStats.OFFICER,
        total_admins: userStats.ADMIN,
        total_departments: departments.length,
        total_categories: categories.length,
      },
      grievances_by_status: grievanceStats.byStatus,
      grievances_by_priority: grievanceStats.byPriority,
      grievances_by_department: grievanceStats.byDepartment,
      recent_grievances: recentGrievances.slice(0, 10),
    };
  }
}

module.exports = AdminService;
