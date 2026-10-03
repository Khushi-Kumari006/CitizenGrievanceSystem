import React from 'react';
import {
  Clock,
  Eye,
  UserCheck,
  RotateCw,
  CheckCircle2,
  XCircle,
  Archive,
} from 'lucide-react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', className: 'badge-pending', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', className: 'badge-pending', icon: Eye },
  ASSIGNED: { label: 'Assigned', className: 'badge-progress', icon: UserCheck },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-progress', icon: RotateCw },
  RESOLVED: { label: 'Resolved', className: 'badge-resolved', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', className: 'badge-danger', icon: XCircle },
  CLOSED: { label: 'Closed', className: 'badge-closed', icon: Archive },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: 'badge-subtle',
    icon: Clock,
  };
  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <IconComponent size={12} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
