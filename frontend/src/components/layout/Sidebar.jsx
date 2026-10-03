import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { grievanceApi } from '../../api/grievances';
import { deriveNotificationsFromGrievances } from '../../utils/notificationHelper';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  SearchCheck,
  Bell,
  Layers,
  Star,
  HelpCircle,
  User,
  LogOut,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
  Tags,
  PhoneCall,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onCloseMobile }) => {
  const { user, isCitizen, isOfficer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    if (!isCitizen) return;
    try {
      const res = await grievanceApi.getMy();
      if (res.success && res.data?.grievances) {
        const notifs = deriveNotificationsFromGrievances(res.data.grievances);
        const unread = notifs.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const handleUpdate = () => fetchUnreadNotifications();
    window.addEventListener('civiccare-notifications-updated', handleUpdate);
    return () => window.removeEventListener('civiccare-notifications-updated', handleUpdate);
  }, [isCitizen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: BarChart3 },
        { to: '/admin/grievances', label: 'All Grievances', icon: ClipboardList },
        { to: '/admin/users', label: 'User Management', icon: Users },
        { to: '/admin/departments', label: 'Departments', icon: Building2 },
        { to: '/admin/categories', label: 'Categories', icon: Tags },
        { to: '/profile', label: 'My Profile', icon: User },
      ];
    }
    if (isOfficer) {
      return [
        { to: '/officer/dashboard', label: 'Officer Dashboard', icon: LayoutDashboard },
        { to: '/officer/grievances', label: 'Assigned Grievances', icon: ClipboardList },
        { to: '/profile', label: 'My Profile', icon: User },
      ];
    }
    // Citizen Navigation Items
    return [
      { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/citizen/submit', label: 'Submit Grievance', icon: PlusCircle },
      { to: '/citizen/grievances', label: 'My Grievances', icon: ListOrdered },
      { to: '/citizen/track', label: 'Track Grievance', icon: SearchCheck },
      { to: '/citizen/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
      { to: '/citizen/services', label: 'Civic Services', icon: Layers },
      { to: '/citizen/feedback', label: 'Feedback', icon: Star },
      { to: '/citizen/help', label: 'Help & FAQ', icon: HelpCircle },
      { to: '/profile', label: 'My Profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 48,
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal), background-color var(--transition-normal)',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Banner in Sidebar */}
        <div
          style={{
            height: 'var(--navbar-height)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-heading)',
                letterSpacing: '-0.01em',
              }}
            >
              {isAdmin ? 'Admin Console' : isOfficer ? 'Officer Desk' : 'Citizen Portal'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              {user?.email || 'Logged in user'}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-placeholder)',
              padding: '0.4rem 0.6rem',
              letterSpacing: '0.06em',
            }}
          >
            Navigation
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={16} />
                  <span>{link.label}</span>
                </div>
                {Boolean(link.badge) && (
                  <span
                    className="badge badge-danger"
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.4rem',
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="divider" style={{ margin: '0.75rem 0' }} />

          {/* Quick Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: 'var(--status-danger-text)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Sidebar Helpline card */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <PhoneCall size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              Citizen Helpline
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Toll-Free: <strong style={{ color: 'var(--text-main)' }}>1800-345-0011</strong>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
