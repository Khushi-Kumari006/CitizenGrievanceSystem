import React from 'react';

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', className: 'badge-priority-low' },
  MEDIUM: { label: 'Medium', className: 'badge-priority-medium' },
  HIGH: { label: 'High', className: 'badge-priority-high' },
  CRITICAL: { label: 'Critical', className: 'badge-priority-critical' },
};

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || { label: priority || 'Medium', className: 'badge-priority-medium' };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};

export default PriorityBadge;
