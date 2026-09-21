/**
 * Utility to generate and manage dynamic notifications for Citizens
 * based on grievance lifecycle events (status transitions, officer assignments, resolutions).
 */

const STORAGE_KEY_READ = 'civiccare_read_notifications';

export const getReadNotificationIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markNotificationAsRead = (notificationId) => {
  const readIds = getReadNotificationIds();
  if (!readIds.includes(notificationId)) {
    readIds.push(notificationId);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(readIds));
    window.dispatchEvent(new Event('civiccare-notifications-updated'));
  }
};

export const markAllNotificationsAsRead = (notifications) => {
  const allIds = notifications.map((n) => n.id);
  localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(allIds));
  window.dispatchEvent(new Event('civiccare-notifications-updated'));
};

/**
 * Derives notifications from a list of citizen grievances.
 * @param {Array} grievances - Array of grievance records
 * @returns {Array} Formatted, sorted notification items
 */
export const deriveNotificationsFromGrievances = (grievances = []) => {
  const readIds = getReadNotificationIds();
  const notifications = [];

  grievances.forEach((g) => {
    // 1. Grievance Created notification
    notifications.push({
      id: `notif_created_${g.id}_${new Date(g.created_at).getTime()}`,
      grievanceId: g.id,
      grievanceNumber: g.grievance_number,
      title: 'Grievance Registered',
      message: `Your grievance "${g.title}" was submitted successfully and assigned tracking number ${g.grievance_number}.`,
      type: 'SUBMISSION',
      timestamp: new Date(g.created_at).toISOString(),
      isRead: readIds.includes(`notif_created_${g.id}_${new Date(g.created_at).getTime()}`),
      status: g.status,
      priority: g.priority,
      department: g.department_name,
    });

    // 2. Officer Assignment notification
    if (g.assigned_officer_id && g.officer_name) {
      notifications.push({
        id: `notif_assigned_${g.id}_${g.assigned_officer_id}`,
        grievanceId: g.id,
        grievanceNumber: g.grievance_number,
        title: 'Officer Assigned',
        message: `Officer ${g.officer_name} has been assigned to inspect and resolve your grievance (${g.grievance_number}).`,
        type: 'ASSIGNMENT',
        timestamp: new Date(g.updated_at || g.created_at).toISOString(),
        isRead: readIds.includes(`notif_assigned_${g.id}_${g.assigned_officer_id}`),
        status: g.status,
        priority: g.priority,
        department: g.department_name,
      });
    }

    // 3. In Progress notification
    if (g.status === 'IN_PROGRESS') {
      notifications.push({
        id: `notif_inprogress_${g.id}_${new Date(g.updated_at).getTime()}`,
        grievanceId: g.id,
        grievanceNumber: g.grievance_number,
        title: 'Work In Progress',
        message: `Remedial action is actively underway for "${g.title}" by the ${g.department_name}.`,
        type: 'STATUS_UPDATE',
        timestamp: new Date(g.updated_at).toISOString(),
        isRead: readIds.includes(`notif_inprogress_${g.id}_${new Date(g.updated_at).getTime()}`),
        status: g.status,
        priority: g.priority,
        department: g.department_name,
      });
    }

    // 4. Resolution notification
    if (g.status === 'RESOLVED' || g.status === 'CLOSED') {
      notifications.push({
        id: `notif_resolved_${g.id}_${g.resolved_at ? new Date(g.resolved_at).getTime() : new Date(g.updated_at).getTime()}`,
        grievanceId: g.id,
        grievanceNumber: g.grievance_number,
        title: g.status === 'RESOLVED' ? 'Grievance Resolved 🎉' : 'Grievance Closed',
        message: `Your grievance (${g.grievance_number}) has been marked as ${g.status}. Please submit your feedback to help us improve.`,
        type: 'RESOLUTION',
        timestamp: g.resolved_at ? new Date(g.resolved_at).toISOString() : new Date(g.updated_at).toISOString(),
        isRead: readIds.includes(`notif_resolved_${g.id}_${g.resolved_at ? new Date(g.resolved_at).getTime() : new Date(g.updated_at).getTime()}`),
        status: g.status,
        priority: g.priority,
        department: g.department_name,
        canFeedback: true,
      });
    }

    // 5. Rejected notification
    if (g.status === 'REJECTED') {
      notifications.push({
        id: `notif_rejected_${g.id}_${new Date(g.updated_at).getTime()}`,
        grievanceId: g.id,
        grievanceNumber: g.grievance_number,
        title: 'Grievance Rejected / Closed',
        message: `Grievance (${g.grievance_number}) could not be processed. View details to check remarks or appeal.`,
        type: 'REJECTION',
        timestamp: new Date(g.updated_at).toISOString(),
        isRead: readIds.includes(`notif_rejected_${g.id}_${new Date(g.updated_at).getTime()}`),
        status: g.status,
        priority: g.priority,
        department: g.department_name,
      });
    }
  });

  // Sort descending by timestamp
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
