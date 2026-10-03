import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Search,
  Droplets,
  Milestone,
  Trash2,
  Zap,
  Lightbulb,
  Waves,
  Sparkles,
  Bus,
  HelpCircle,
  PhoneCall,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';

const CIVIC_SERVICES = [
  {
    name: 'Water Supply',
    icon: Droplets,
    desc: 'Leakages, low pressure, dirty water & meter faults',
    dept: 'Water Department',
  },
  {
    name: 'Roads',
    icon: Milestone,
    desc: 'Potholes, damaged pathways & missing signs',
    dept: 'Road Department',
  },
  {
    name: 'Garbage',
    icon: Trash2,
    desc: 'Uncollected waste & overflowing public bins',
    dept: 'Sanitation Department',
  },
  {
    name: 'Electricity',
    icon: Zap,
    desc: 'Power cuts, loose cables & transformer hazards',
    dept: 'Electricity Department',
  },
  {
    name: 'Street Lights',
    icon: Lightbulb,
    desc: 'Dark streets, damaged poles & flickering fixtures',
    dept: 'Electricity Department',
  },
  {
    name: 'Drainage',
    icon: Waves,
    desc: 'Blocked storm drains & sewer waterlogging',
    dept: 'Sanitation Department',
  },
  {
    name: 'Sanitation',
    icon: Sparkles,
    desc: 'Pest fumigation & public restroom hygiene',
    dept: 'Sanitation Department',
  },
  {
    name: 'Public Transport',
    icon: Bus,
    desc: 'Transit shelters, bus timings & feeder services',
    dept: 'Public Transport Department',
  },
  {
    name: 'Other Issues',
    icon: HelpCircle,
    desc: 'Municipal queries, noise nuisance & civic matters',
    dept: 'General Administration',
  },
];

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await grievanceApi.getMy();
        if (res.success && res.data?.grievances) {
          const list = res.data.grievances;

          const total = list.length;
          const pending = list.filter((g) =>
            ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(g.status)
          ).length;
          const inProgress = list.filter((g) => g.status === 'IN_PROGRESS').length;
          const resolved = list.filter((g) =>
            ['RESOLVED', 'CLOSED'].includes(g.status)
          ).length;

          setStats({ total, pending, inProgress, resolved });
          setRecentGrievances(list.slice(0, 5));
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault();
    const query = trackingNumberInput.trim();
    if (!query) {
      showToast('Please enter a valid tracking number', 'error');
      return;
    }
    navigate(`/citizen/track?trackingNumber=${encodeURIComponent(query)}`);
  };

  const handleCivicServiceClick = (service) => {
    navigate(
      `/citizen/submit?category=${encodeURIComponent(service.name)}&department=${encodeURIComponent(
        service.dept
      )}`
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard data..." fullPage />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome & Primary Action Strip */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
            Overview of your reported issues and municipal civic services
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link to="/citizen/submit" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Lodge Grievance</span>
          </Link>
          <Link to="/citizen/grievances" className="btn btn-secondary">
            <span>View All Records</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Compact 4-Block Statistics Row */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">
            <span>Total Lodged</span>
            <FileText size={15} />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-helper">All lifetime submissions</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            <span>Pending Review</span>
            <Clock size={15} color="var(--status-pending-text)" />
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-helper">Awaiting officer action</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            <span>In Progress</span>
            <RotateCw size={15} color="var(--status-progress-text)" />
          </div>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-helper">Active on-site resolution</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            <span>Resolved</span>
            <CheckCircle2 size={15} color="var(--status-resolved-text)" />
          </div>
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-helper">Completed cases</div>
        </div>
      </div>

      {/* Quick Track Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <SearchCheck size={18} color="var(--primary)" />
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
              Quick Grievance Tracker
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Enter your tracking code (e.g. GRV-2026-...) to check real-time progress
            </p>
          </div>
        </div>

        <form
          onSubmit={handleQuickTrackSubmit}
          style={{ display: 'flex', gap: '0.4rem', flex: '1', maxWidth: '380px', minWidth: '240px' }}
        >
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
            placeholder="Enter tracking code..."
            value={trackingNumberInput}
            onChange={(e) => setTrackingNumberInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Search size={14} />
            <span>Track</span>
          </button>
        </form>
      </div>

      {/* Civic Services Quick Directory */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="card-title">Civic Services Directory</span>
            <span className="badge badge-subtle">9 Services</span>
          </div>
          <Link to="/citizen/services" className="text-xs text-primary font-semibold flex-center" style={{ gap: '0.25rem' }}>
            <span>View Full Directory</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--border-subtle)',
          }}
        >
          {CIVIC_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.name}
                onClick={() => handleCivicServiceClick(srv)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.75rem',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                    {srv.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.15rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {srv.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Grievances List / Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="card-title">Recent Grievances</span>
            {recentGrievances.length > 0 && (
              <span className="badge badge-subtle">{recentGrievances.length} recent</span>
            )}
          </div>
          <Link to="/citizen/grievances" className="text-xs text-primary font-semibold flex-center" style={{ gap: '0.25rem' }}>
            <span>Manage All Grievances</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {recentGrievances.length === 0 ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              You haven't filed any grievances yet.
            </p>
            <Link to="/citizen/submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              <PlusCircle size={14} />
              <span>Report Your First Grievance</span>
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentGrievances.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {item.trackingNumber}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-heading)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '0.1rem',
                        }}
                      >
                        {item.description}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>{item.category?.name || 'General'}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/citizen/track?trackingNumber=${encodeURIComponent(item.trackingNumber)}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                        >
                          Track
                        </Link>
                        <Link
                          to={`/grievances/${item.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Civic Support Notice */}
      <div
        className="card"
        style={{
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            All grievances are tracked under the <strong style={{ color: 'var(--text-main)' }}>Public Service Guarantee Charter</strong> with guaranteed resolution SLAs.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PhoneCall size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Support: <strong>1800-345-0011</strong> (Toll Free)
          </span>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
