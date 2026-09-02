import React from 'react';

const ROLE_CONFIG = {
  CITIZEN: { label: 'Citizen', className: 'badge-role-citizen' },
  OFFICER: { label: 'Officer', className: 'badge-role-officer' },
  ADMIN: { label: 'Admin', className: 'badge-role-admin' },
};

export const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || { label: role || 'User', className: 'badge-role-citizen' };

  return <span className={`badge ${config.className}`}>{config.label}</span>;
};

export default RoleBadge;
