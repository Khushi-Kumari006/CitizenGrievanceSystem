import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { grievanceApi } from '../../api/grievances';
import { RoleBadge } from '../common/RoleBadge';
import { deriveNotificationsFromGrievances, markNotificationAsRead, markAllNotificationsAsRead } from '../../utils/notificationHelper';
import { Menu, LogOut, User as UserIcon, Shield, Bell, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isCitizen, logout } = useAuth();
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
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('civiccare-notifications-updated', handleUpdate);
    return () => window.removeEventListener('civiccare-notifications-updated', handleUpdate);
  }, [isCitizen]);

  // Close dropdown on outside click
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
            {/* Citizen Notification Bell */}
            {isCitizen && (
              <div className="notif-btn-wrapper" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen((prev) => !prev)}
                  className="btn btn-secondary btn-icon"
                  style={{ position: 'relative' }}
                  title="Grievance Notifications"
                  aria-label="View notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                {/* Popover Dropdown */}
                {isNotifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="badge badge-submitted" style={{ fontSize: '0.65rem' }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="notif-dropdown-body">
                      {recentNotifications.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No notifications at this time
                        </div>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div style={{ paddingTop: '2px' }}>
                              {notif.type === 'RESOLUTION' ? (
                                <CheckCircle2 size={18} color="var(--success)" />
                              ) : notif.type === 'ASSIGNMENT' ? (
                                <Shield size={18} color="var(--primary)" />
                              ) : (
                                <Clock size={18} color="var(--warning)" />
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{notif.title}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {new Date(notif.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {notif.message}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                      <Link
                        to="/citizen/notifications"
                        onClick={() => setIsNotifOpen(false)}
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <span>View All Notifications</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

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
