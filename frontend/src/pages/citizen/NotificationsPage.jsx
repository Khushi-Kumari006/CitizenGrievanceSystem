import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
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
  Inbox,
  CheckCheck,
  Star,
  SearchCheck,
} from 'lucide-react';

export const NotificationsPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD, STATUS, ASSIGNMENT, RESOLUTION
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Notifications & Updates</h1>
            {unreadCount > 0 && (
              <span className="badge badge-submitted" style={{ fontSize: '0.75rem' }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Chronological alerts on status changes, officer assignments, and resolution milestones
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm">
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs Filter Bar */}
      <div className="filter-chip-group">
        <button
          className={`filter-chip ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          <span>All Notifications ({notifications.length})</span>
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
          <ShieldCheck size={14} />
          <span>Officer Assignments</span>
        </button>
        <button
          className={`filter-chip ${activeTab === 'STATUS' ? 'active' : ''}`}
          onClick={() => setActiveTab('STATUS')}
        >
          <Clock size={14} />
          <span>Status Updates</span>
        </button>
        <button
          className={`filter-chip ${activeTab === 'RESOLUTION' ? 'active' : ''}`}
          onClick={() => setActiveTab('RESOLUTION')}
        >
          <CheckCircle2 size={14} />
          <span>Resolutions</span>
        </button>
      </div>

      {/* Notifications List Feed */}
      {isLoading ? (
        <LoadingSpinner text="Fetching notifications feed..." fullPage={true} />
      ) : filteredNotifications.length === 0 ? (
        <div className="card empty-state">
          <Inbox size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Notifications</h3>
          <p style={{ marginTop: '0.375rem', fontSize: '0.875rem' }}>
            {activeTab === 'UNREAD'
              ? 'You have caught up with all updates! No unread notifications.'
              : 'There are no notifications matching the selected category.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                borderLeft: !notif.isRead ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: !notif.isRead ? '#f8faff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => handleItemClick(notif)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor:
                        notif.type === 'RESOLUTION'
                          ? '#dcfce7'
                          : notif.type === 'ASSIGNMENT'
                          ? '#e0e7ff'
                          : '#fef3c7',
                      color:
                        notif.type === 'RESOLUTION'
                          ? '#166534'
                          : notif.type === 'ASSIGNMENT'
                          ? '#4338ca'
                          : '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {notif.type === 'RESOLUTION' ? (
                      <CheckCircle2 size={20} />
                    ) : notif.type === 'ASSIGNMENT' ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {notif.grievanceNumber}
                      </span>
                      <StatusBadge status={notif.status} />
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Dept: <strong>{notif.department}</strong></span>
                      <span>•</span>
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      {!notif.isRead && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>New update</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/citizen/track?number=${notif.grievanceNumber}`}
                    className="btn btn-outline btn-sm"
                    title="Track progress"
                  >
                    <SearchCheck size={14} />
                    <span>Track</span>
                  </Link>
                  {notif.canFeedback && (
                    <Link
                      to={`/citizen/feedback?id=${notif.grievanceId}`}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                    >
                      <Star size={14} />
                      <span>Feedback</span>
                    </Link>
                  )}
                  <Link to={`/grievances/${notif.grievanceId}`} className="btn btn-secondary btn-sm">
                    <span>View</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
