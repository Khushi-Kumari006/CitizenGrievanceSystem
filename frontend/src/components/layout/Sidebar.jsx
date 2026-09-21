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
  ShieldAlert,
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
      // ignore network errors silently in background badge count
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const handleUpdate = () => fetchUnreadNotifications();
    window.addEventListener('civiccare-notifications-updated', handleUpdate);
    return () => window.removeEventListener('civiccare-notifications-updated', handleUpdate);
  }, [isCitizen]);

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
    // Citizen workspace links (Matches Requirement #9)
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
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
            display: 'block',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          zIndex: 45,
          position: isOpen ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Banner in Sidebar */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
              Citizen Portal
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-sidebar-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.role} Workspace
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
            Menu Navigation
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
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} />
                  <span>{link.label}</span>
                </div>
                {Boolean(link.badge) && (
                  <span
                    style={{
                      backgroundColor: 'var(--danger)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      minWidth: '18px',
                      textAlign: 'center',
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Logout in Sidebar menu */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#f87171',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>

        {/* Sidebar Footer info */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.75rem', color: '#64748b' }}>
          CivicCare Grievance v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
