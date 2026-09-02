import React from 'react';
import { Clock, Eye, UserCheck, Play, CheckCircle2, XCircle, Archive } from 'lucide-react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', className: 'badge-submitted', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', className: 'badge-under_review', icon: Eye },
  ASSIGNED: { label: 'Assigned', className: 'badge-assigned', icon: UserCheck },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in_progress', icon: Play },
  RESOLVED: { label: 'Resolved', className: 'badge-resolved', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },
  CLOSED: { label: 'Closed', className: 'badge-closed', icon: Archive },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', className: 'badge-closed', icon: Clock };
  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <IconComponent size={12} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
