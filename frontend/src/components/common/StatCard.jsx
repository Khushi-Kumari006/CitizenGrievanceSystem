import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
}) => {
  return (
    <div className="stat-item">
      <div className="stat-label">
        <span>{title}</span>
        {Icon && <Icon size={16} style={{ opacity: 0.7 }} />}
      </div>
      <div className="stat-value">
        {value !== undefined && value !== null ? value : 0}
      </div>
      {subtitle && <div className="stat-helper">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
