import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

const PRIORITY_STYLES = {
  LOW: {
    label: 'Low',
    icon: ArrowDown,
    color: 'var(--priority-low-text)',
    bg: 'var(--priority-low-bg)',
    border: 'var(--priority-low-border)',
  },
  MEDIUM: {
    label: 'Medium',
    icon: ArrowUp,
    color: 'var(--priority-medium-text)',
    bg: 'var(--priority-medium-bg)',
    border: 'var(--priority-medium-border)',
  },
  HIGH: {
    label: 'High',
    icon: AlertTriangle,
    color: 'var(--priority-high-text)',
    bg: 'var(--priority-high-bg)',
    border: 'var(--priority-high-border)',
  },
  CRITICAL: {
    label: 'Critical',
    icon: AlertCircle,
    color: 'var(--priority-urgent-text)',
    bg: 'var(--priority-urgent-bg)',
    border: 'var(--priority-urgent-border)',
  },
};

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;
  const IconComponent = config.icon;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <IconComponent size={11} />
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
