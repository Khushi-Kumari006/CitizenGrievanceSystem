import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  deriveNotificationsFromGrievances,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../utils/notificationHelper';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Bell,
  CheckCheck,
} from 'lucide-react';

export const NotificationsPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD, ASSIGNMENT, STATUS, RESOLUTION
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchGrievancesAndNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await grievanceApi.getMy();
      if (res.success && res.data?.grievances) {
        setGrievances(res.data.grievances);
        const derived = deriveNotificationsFromGrievances(res.data.grievances);
        setNotifications(derived);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievancesAndNotifications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleUpdate = () => {
      const derived = deriveNotificationsFromGrievances(grievances);
      setNotifications(derived);
    };
    window.addEventListener('civiccare-notifications-updated', handleUpdate);
    return () => window.removeEventListener('civiccare-notifications-updated', handleUpdate);
  }, [grievances]);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'success');
  };

  const handleItemClick = (notif) => {
    markNotificationAsRead(notif.id);
    navigate(`/grievances/${notif.grievanceId}`);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'UNREAD') return !item.isRead;
      if (activeTab === 'STATUS') return item.type === 'STATUS_UPDATE';
      if (activeTab === 'ASSIGNMENT') return item.type === 'ASSIGNMENT';
      if (activeTab === 'RESOLUTION') return item.type === 'RESOLUTION';
      return true;
    });
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="badge badge-pending">{unreadCount} unread</span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
            Official alerts, inspection updates, and departmental resolutions
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '0.5rem' }}>
        <div className="filter-chip-group" style={{ width: '100%', overflowX: 'auto' }}>
          <button
            className={`filter-chip ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <span>All Updates ({notifications.length})</span>
          </button>
          <button
            className={`filter-chip ${activeTab === 'UNREAD' ? 'active' : ''}`}
            onClick={() => setActiveTab('UNREAD')}
          >
            <span>Unread ({unreadCount})</span>
          </button>
          <button
            className={`filter-chip ${activeTab === 'ASSIGNMENT' ? 'active' : ''}`}
            onClick={() => setActiveTab('ASSIGNMENT')}
          >
            <span>Officer Assignments</span>
          </button>
          <button
            className={`filter-chip ${activeTab === 'STATUS' ? 'active' : ''}`}
            onClick={() => setActiveTab('STATUS')}
          >
            <span>Status Changes</span>
          </button>
          <button
            className={`filter-chip ${activeTab === 'RESOLUTION' ? 'active' : ''}`}
            onClick={() => setActiveTab('RESOLUTION')}
          >
            <span>Resolutions</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Activity Feed</span>
          <span className="badge badge-subtle">{filteredNotifications.length} items</span>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading notifications..." />
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <Bell size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              No notifications in this view
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {activeTab === 'UNREAD'
                ? 'All caught up! You have no unread notifications.'
                : 'No activities logged under this category yet.'}
            </p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom:
                    idx < filteredNotifications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  backgroundColor: item.isRead ? 'transparent' : 'var(--bg-subtle)',
                  borderLeft: item.isRead ? '3px solid transparent' : '3px solid var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = item.isRead ? 'transparent' : 'var(--bg-subtle)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {item.type === 'RESOLUTION' ? (
                      <CheckCircle2 size={18} color="var(--status-resolved-text)" />
                    ) : item.type === 'ASSIGNMENT' ? (
                      <ShieldCheck size={18} color="var(--primary)" />
                    ) : (
                      <Clock size={18} color="var(--status-pending-text)" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>
                          New
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {item.message}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>
                  <span className="text-xs font-semibold">View Case</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
