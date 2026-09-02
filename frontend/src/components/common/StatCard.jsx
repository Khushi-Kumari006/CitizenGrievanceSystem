import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = '#2563eb', bg = '#eff6ff', subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color }}>
        <Icon size={26} />
      </div>
      <div>
        <div className="stat-value" style={{ color: 'var(--text-main)' }}>
          {value !== undefined && value !== null ? value : 0}
        </div>
        <div className="stat-label">{title}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
