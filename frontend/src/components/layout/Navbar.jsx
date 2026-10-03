import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { grievanceApi } from '../../api/grievances';
import { RoleBadge } from '../common/RoleBadge';
import {
  deriveNotificationsFromGrievances,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../utils/notificationHelper';
import {
  Menu,
  LogOut,
  User as UserIcon,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Landmark,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isCitizen, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isCitizen) return;
    try {
      const res = await grievanceApi.getMy();
      if (res.success && res.data?.grievances) {
        const notifs = deriveNotificationsFromGrievances(res.data.grievances);
        setNotifications(notifs);
      }
    } catch {
      // ignore silently in background
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('civiccare-notifications-updated', handleUpdate);
    return () => window.removeEventListener('civiccare-notifications-updated', handleUpdate);
  }, [isCitizen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 4);

  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    setIsNotifOpen(false);
    navigate(`/grievances/${notif.grievanceId}`);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllNotificationsAsRead(notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left Branding & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-icon"
          style={{ display: 'inline-flex' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-text)',
            }}
          >
            <Landmark size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '1.15rem',
                color: 'var(--text-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              CivicCare
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Portal
            </span>
          </div>
        </div>
      </div>

      {/* Right User & Utility Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark/light theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {user && (
          <>
            {/* Citizen Notification Bell Dropdown */}
            {isCitizen && (
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen((prev) => !prev)}
                  className="btn btn-secondary btn-icon"
                  style={{ position: 'relative' }}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--status-danger-text)',
                      }}
                    />
                  )}
                </button>

                {/* Notification Dropdown Popover */}
                {isNotifOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '320px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 100,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary font-semibold"
                          style={{ cursor: 'pointer' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {recentNotifications.length === 0 ? (
                        <div
                          style={{
                            padding: '1.5rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '0.8125rem',
                          }}
                        >
                          No recent notifications
                        </div>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border-subtle)',
                              backgroundColor: notif.isRead ? 'transparent' : 'var(--bg-subtle)',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '0.65rem',
                              transition: 'background-color var(--transition-fast)',
                            }}
                          >
                            <div style={{ marginTop: '2px', flexShrink: 0 }}>
                              {notif.type === 'RESOLUTION' ? (
                                <CheckCircle2 size={16} color="var(--status-resolved-text)" />
                              ) : notif.type === 'ASSIGNMENT' ? (
                                <ShieldCheck size={16} color="var(--primary)" />
                              ) : (
                                <Clock size={16} color="var(--status-pending-text)" />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'baseline',
                                  gap: '0.5rem',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    color: 'var(--text-heading)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {notif.title}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  marginTop: '0.15rem',
                                  lineHeight: 1.35,
                                }}
                              >
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div
                      style={{
                        padding: '0.6rem 1rem',
                        borderTop: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-subtle)',
                        textAlign: 'center',
                      }}
                    >
                      <Link
                        to="/citizen/notifications"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs text-primary font-semibold flex-center"
                        style={{ gap: '0.35rem' }}
                      >
                        <span>View All Notifications</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Role Badge */}
            <RoleBadge role={user.role} />

            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--border-color)',
                margin: '0 0.2rem',
              }}
            />

            {/* Profile Link & Logout */}
            <Link to="/profile" className="btn btn-secondary btn-sm" title="My Profile">
              <UserIcon size={14} />
              <span>Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              title="Logout"
              style={{ color: 'var(--status-danger-text)' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
