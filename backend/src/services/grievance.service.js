const Grievance = require('../models/Grievance');
const GrievanceCategory = require('../models/GrievanceCategory');
const Department = require('../models/Department');
const GrievanceStatusHistory = require('../models/GrievanceStatusHistory');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { ROLES, STATUSES, PRIORITIES } = require('../constants');

class GrievanceService {
  /**
   * Helper to generate unique grievance tracking number
   * Format: GRV-YYYYMMDD-XXXXX
   */
  static generateGrievanceNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `GRV-${dateStr}-${randomHex}`;
  }

  /**
   * Submit a new grievance
   * @param {Object} data
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>} Created grievance
   */
  static async createGrievance(data, user) {
    const { title, description, category_id, department_id, priority = PRIORITIES.MEDIUM, location = null, attachment_path = null } = data;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      const error = new Error('Grievance title is required');
      error.statusCode = 400;
      throw error;
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      const error = new Error('Grievance description is required');
      error.statusCode = 400;
      throw error;
    }

    if (!category_id) {
      const error = new Error('Category ID is required');
      error.statusCode = 400;
      throw error;
    }

    if (!department_id) {
      const error = new Error('Department ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Verify category exists
    const category = await GrievanceCategory.findById(category_id);
    if (!category) {
      const error = new Error('Selected grievance category does not exist');
      error.statusCode = 400;
      throw error;
    }

    // Verify department exists
    const department = await Department.findById(department_id);
    if (!department) {
      const error = new Error('Selected department does not exist');
      error.statusCode = 400;
      throw error;
    }

    // Verify priority is valid
    const cleanPriority = priority && Object.values(PRIORITIES).includes(priority.toUpperCase())
      ? priority.toUpperCase()
      : PRIORITIES.MEDIUM;

    const grievance_number = this.generateGrievanceNumber();

    const insertId = await Grievance.create({
      grievance_number,
      citizen_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category_id,
      department_id,
      assigned_officer_id: null,
      priority: cleanPriority,
      status: STATUSES.SUBMITTED,
      location: location ? location.trim() : null,
      attachment_path: attachment_path || null,
    });

    // Create initial audit log in grievance_status_history
    await GrievanceStatusHistory.create({
      grievance_id: insertId,
      old_status: null,
      new_status: STATUSES.SUBMITTED,
      changed_by: user.id,
      remarks: 'Grievance submitted by citizen',
    });

    return Grievance.findById(insertId);
  }

  /**
   * Get all grievances with role-based visibility and filters
   * @param {Object} query - Query parameters (status, priority, department_id, search, etc.)
   * @param {Object} user - Authenticated user
   * @returns {Promise<Array>}
   */
  static async getAllGrievances(query = {}, user) {
    const filters = {};

    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.department_id) filters.department_id = query.department_id;
    if (query.category_id) filters.category_id = query.category_id;
    if (query.search) filters.search = query.search;

    // Enforce role-based access
    if (user.role === ROLES.CITIZEN) {
      filters.citizen_id = user.id;
    } else if (user.role === ROLES.OFFICER) {
      // If officer specifically queries assigned to them or views department grievances
      if (query.my_assigned === 'true' || !query.department_id) {
        filters.assigned_officer_id = user.id;
      }
    }
    // ADMIN has unrestricted view

    return Grievance.findAll(filters);
  }

  /**
   * Get current citizen's grievances
   * @param {number} citizenId
   * @returns {Promise<Array>}
   */
  static async getCitizenGrievances(citizenId) {
    return Grievance.findAll({ citizen_id: citizenId });
  }

  /**
   * Get detailed grievance by ID or tracking number (with comments & history)
   * @param {number|string} idOrNumber
   * @param {Object} user - Authenticated user
   * @returns {Promise<Object>}
   */
  static async getGrievanceDetails(idOrNumber, user) {
    let grievance;
    if (!isNaN(idOrNumber)) {
      grievance = await Grievance.findById(parseInt(idOrNumber, 10));
    } else {
      grievance = await Grievance.findByGrievanceNumber(idOrNumber);
    }

    if (!grievance) {
      const error = new Error('Grievance not found');
      error.statusCode = 404;
      throw error;
    }

    // Role-based authorization
    if (user.role === ROLES.CITIZEN && grievance.citizen_id !== user.id) {
      const error = new Error('Access denied: You do not have permission to view this grievance');
      error.statusCode = 403;
      throw error;
    }

    // Fetch comments and status history
    const [comments, history] = await Promise.all([
      Comment.findByGrievanceId(grievance.id),
      GrievanceStatusHistory.findByGrievanceId(grievance.id),
    ]);

    return {
      ...grievance,
      comments,
      status_history: history,
    };
  }

  /**
   * Update editable grievance fields
   * @param {number} id
   * @param {Object} updates
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  static async updateGrievance(id, updates, user) {
    const grievance = await Grievance.findById(id);
    if (!grievance) {
      const error = new Error('Grievance not found');
      error.statusCode = 404;
      throw error;
    }

    // Citizen can only update if status is still SUBMITTED
    if (user.role === ROLES.CITIZEN) {
      if (grievance.citizen_id !== user.id) {
        const error = new Error('Access denied');
        error.statusCode = 403;
        throw error;
      }
      if (grievance.status !== STATUSES.SUBMITTED) {
        const error = new Error('Cannot edit grievance once it has been reviewed or processed');
        error.statusCode = 400;
        throw error;
      }
    }

    const payload = {};
    if (updates.title) payload.title = updates.title.trim();
    if (updates.description) payload.description = updates.description.trim();
    if (updates.location !== undefined) payload.location = updates.location ? updates.location.trim() : null;
    if (updates.priority && Object.values(PRIORITIES).includes(updates.priority)) {
      payload.priority = updates.priority;
    }
    if (updates.category_id) payload.category_id = updates.category_id;
    if (updates.department_id) payload.department_id = updates.department_id;
    if (updates.attachment_path !== undefined) payload.attachment_path = updates.attachment_path;

    await Grievance.update(id, payload);
    return this.getGrievanceDetails(id, user);
  }

  /**
   * Update grievance status and log audit history
   * @param {number} id
   * @param {Object} data - { status, remarks }
   * @param {Object} user - Authenticated user (OFFICER or ADMIN)
   * @returns {Promise<Object>}
   */
  static async updateStatus(id, { status, remarks }, user) {
    if (!status || !Object.values(STATUSES).includes(status)) {
      const error = new Error(`Invalid status. Allowed values: ${Object.values(STATUSES).join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const grievance = await Grievance.findById(id);
    if (!grievance) {
      const error = new Error('Grievance not found');
      error.statusCode = 404;
      throw error;
    }

    // Officer permission check
    if (user.role === ROLES.OFFICER) {
      if (grievance.assigned_officer_id !== user.id && grievance.department_id !== user.department_id) {
        const error = new Error('You are not authorized to update grievances outside your assignment');
        error.statusCode = 403;
        throw error;
      }
    }

    const oldStatus = grievance.status;
    const resolvedAt = (status === STATUSES.RESOLVED || status === STATUSES.CLOSED) ? new Date() : null;

    await Grievance.updateStatus(id, status, resolvedAt);

    // Record status transition in audit log
    await GrievanceStatusHistory.create({
      grievance_id: id,
      old_status: oldStatus,
      new_status: status,
      changed_by: user.id,
      remarks: remarks ? remarks.trim() : `Status changed from ${oldStatus} to ${status}`,
    });

    return this.getGrievanceDetails(id, user);
  }

  /**
   * Assign an officer to a grievance
   * @param {number} id
   * @param {number} officerId
   * @param {Object} user - Authenticated user (ADMIN or OFFICER)
   * @returns {Promise<Object>}
   */
  static async assignOfficer(id, officerId, user) {
    const grievance = await Grievance.findById(id);
    if (!grievance) {
      const error = new Error('Grievance not found');
      error.statusCode = 404;
      throw error;
    }

    const officer = await User.findById(officerId);
    if (!officer || officer.role !== ROLES.OFFICER) {
      const error = new Error('Invalid officer ID: designated user is not an active officer');
      error.statusCode = 400;
      throw error;
    }

    await Grievance.assignOfficer(id, officerId);

    // Automatically transition to ASSIGNED if currently SUBMITTED or UNDER_REVIEW
    if (grievance.status === STATUSES.SUBMITTED || grievance.status === STATUSES.UNDER_REVIEW) {
      await Grievance.updateStatus(id, STATUSES.ASSIGNED);
      await GrievanceStatusHistory.create({
        grievance_id: id,
        old_status: grievance.status,
        new_status: STATUSES.ASSIGNED,
        changed_by: user.id,
        remarks: `Assigned to Officer ${officer.name}`,
      });
    } else {
      await GrievanceStatusHistory.create({
        grievance_id: id,
        old_status: grievance.status,
        new_status: grievance.status,
        changed_by: user.id,
        remarks: `Reassigned to Officer ${officer.name}`,
      });
    }

    return this.getGrievanceDetails(id, user);
  }
}

module.exports = GrievanceService;
