import React from 'react';
import { User, Shield, ShieldCheck } from 'lucide-react';

const ROLE_CONFIG = {
  CITIZEN: { label: 'Citizen', icon: User },
  OFFICER: { label: 'Officer', icon: ShieldCheck },
  ADMIN: { label: 'Admin', icon: Shield },
};

export const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || {
    label: role || 'User',
    icon: User,
  };
  const IconComponent = config.icon;

  return (
    <span className="badge badge-subtle">
      <IconComponent size={11} />
      <span>{config.label}</span>
    </span>
  );
};

export default RoleBadge;
