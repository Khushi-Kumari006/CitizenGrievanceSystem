import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/RoleBadge';
import { Menu, LogOut, User as UserIcon, Shield, Bell } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-icon"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Shield size={20} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)' }}>
            CivicCare<span style={{ color: 'var(--primary)' }}>.Gov</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-3">
              <RoleBadge role={user.role} />
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }} className="user-name-wrapper">
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>

            <div className="flex items-center gap-2">
              <Link to="/profile" className="btn btn-secondary btn-sm" title="My Profile">
                <UserIcon size={16} />
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Logout">
                <LogOut size={16} color="var(--danger)" />
                <span style={{ color: 'var(--danger)' }}>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
