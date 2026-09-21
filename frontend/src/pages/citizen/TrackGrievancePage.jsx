import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Search,
  SearchCheck,
  Building2,
  Tags,
  User,
  ShieldCheck,
  MapPin,
  Calendar,
  History,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Star,
  AlertCircle,
  Clock,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

const STEP_STAGES = [
  { key: 'SUBMITTED', label: '1. Submitted' },
  { key: 'UNDER_REVIEW', label: '2. Under Review' },
  { key: 'ASSIGNED', label: '3. Assigned' },
  { key: 'IN_PROGRESS', label: '4. In Progress' },
  { key: 'RESOLVED', label: '5. Resolved' },
];

export const TrackGrievancePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('number') || '';
  const [trackingNumber, setTrackingNumber] = useState(initialQuery);
  const [grievance, setGrievance] = useState(null);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch citizen's recent grievances for quick search chips
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await grievanceApi.getMy();
        if (res.success && res.data?.grievances) {
          setRecentGrievances(res.data.grievances.slice(0, 5));
        }
      } catch {
        // ignore
      }
    };
    fetchRecent();
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query || !query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const clean = query.trim();
      const res = await grievanceApi.getById(clean);
      if (res.success && res.data?.grievance) {
        setGrievance(res.data.grievance);
      } else {
        setGrievance(null);
      }
    } catch (err) {
      setGrievance(null);
      showToast(err.message || 'No grievance record found with this tracking number', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (initialQuery) {
      setTrackingNumber(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      showToast('Please enter a valid tracking number (e.g. GRV-2026...) or ID', 'warning');
      return;
    }
    setSearchParams({ number: trackingNumber.trim() });
    performSearch(trackingNumber.trim());
  };

  const handleChipClick = (num) => {
    setTrackingNumber(num);
    setSearchParams({ number: num });
    performSearch(num);
  };

  // Determine active step index in progress stepper
  const getActiveStepIndex = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'RESOLVED':
      case 'CLOSED':
        return 4;
      case 'REJECTED':
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = grievance ? getActiveStepIndex(grievance.status) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Track Grievance Status</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Real-time tracking of investigation, officer assignments, departmental actions, and resolution timelines
        </p>
      </div>

      {/* Tracking Search Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid var(--border-color)',
          padding: '1.75rem',
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Enter Grievance Tracking Number or System ID
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem', fontSize: '1rem', fontFamily: 'monospace', fontWeight: 600 }}
                placeholder="e.g. GRV-20260921-A1B2C or 1"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1.75rem' }} disabled={isLoading}>
              <SearchCheck size={18} />
              <span>{isLoading ? 'Searching...' : 'Track Grievance'}</span>
            </button>
          </div>
        </form>

        {/* Quick Clickable Tracking Chips from citizen's recent submissions */}
        {recentGrievances.length > 0 && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your Recent Grievances:
            </div>
            <div className="filter-chip-group">
              {recentGrievances.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`filter-chip ${trackingNumber === g.grievance_number ? 'active' : ''}`}
                  onClick={() => handleChipClick(g.grievance_number)}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{g.grievance_number}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({g.title.slice(0, 16)}...)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Container */}
      {isLoading ? (
        <LoadingSpinner text="Locating grievance audit records..." />
      ) : grievance ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Progress Stepper Banner */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {grievance.grievance_number}
                  </span>
                  <StatusBadge status={grievance.status} />
                  <PriorityBadge priority={grievance.priority} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{grievance.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                {['RESOLVED', 'CLOSED'].includes(grievance.status) && (
                  <Link to={`/citizen/feedback?id=${grievance.id}`} className="btn btn-sm" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                    <Star size={14} />
                    <span>Provide Feedback</span>
                  </Link>
                )}
                <Link to={`/grievances/${grievance.id}`} className="btn btn-secondary btn-sm">
                  <MessageSquare size={14} />
                  <span>Discussion & Details</span>
                </Link>
              </div>
            </div>

            {/* Stepper Graphic */}
            {grievance.status === 'REJECTED' ? (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#991b1b',
                  marginTop: '1rem',
                }}
              >
                <AlertCircle size={24} />
                <div>
                  <div style={{ fontWeight: 700 }}>Grievance Closed / Rejected</div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    This complaint was scrutinized and closed or marked outside municipal purview. Check audit remarks below.
                  </div>
                </div>
              </div>
            ) : (
              <div className="stepper-container">
                <div className="stepper-track">
                  <div
                    className="stepper-track-progress"
                    style={{
                      width: `${(Math.max(0, activeIndex) / (STEP_STAGES.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {STEP_STAGES.map((step, idx) => {
                  const isCompleted = idx < activeIndex || (idx === activeIndex && activeIndex === STEP_STAGES.length - 1);
                  const isActive = idx === activeIndex && activeIndex < STEP_STAGES.length - 1;

                  return (
                    <div
                      key={step.key}
                      className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      <div className="stepper-circle">
                        {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                      </div>
                      <span className="stepper-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Overview Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Grievance Parameters</h3>
            <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-4">
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Building2 size={16} color="var(--primary)" />
                  <span>Department</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.375rem' }}>
                  {grievance.department_name}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Tags size={16} color="var(--accent)" />
                  <span>Category</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.375rem' }}>
                  {grievance.category_name}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span>Assigned Officer</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.375rem' }}>
                  {grievance.officer_name ? (
                    <span>{grievance.officer_name}</span>
                  ) : (
                    <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontWeight: 500 }}>
                      Pending Allocation
                    </span>
                  )}
                </div>
                {grievance.officer_email && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{grievance.officer_email}</div>
                )}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Calendar size={16} color="#0284c7" />
                  <span>Filed Date</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.375rem' }}>
                  {new Date(grievance.created_at).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(grievance.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Location & Description */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              {grievance.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  <MapPin size={16} color="var(--danger)" />
                  <span><strong>Reported Location:</strong> {grievance.location}</span>
                </div>
              )}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Issue Description:</strong> {grievance.description}
              </div>
            </div>
          </div>

          {/* Chronological Status Audit Timeline */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <History size={20} color="var(--primary)" />
                <h3 className="card-title">Chronological Action & Audit History</h3>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {grievance.status_history?.length || 1} logged events
              </span>
            </div>

            <div className="timeline">
              {grievance.status_history && grievance.status_history.length > 0 ? (
                grievance.status_history.map((h, idx) => (
                  <div key={h.id || idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <StatusBadge status={h.new_status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                        Updated by <strong>{h.changed_by_name || 'System / Municipal Officer'}</strong> {h.changed_by_role && `(${h.changed_by_role})`}
                      </div>
                      {h.remarks && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-main)',
                            marginTop: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#ffffff',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            fontStyle: 'italic',
                          }}
                        >
                          "{h.remarks}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <StatusBadge status={grievance.status} />
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                      Grievance submitted by citizen
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="card empty-state">
          <AlertCircle size={48} className="empty-state-icon" style={{ color: 'var(--warning)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Grievance Record Found</h3>
          <p style={{ marginTop: '0.375rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            We could not find any grievance matching "{trackingNumber}". Please check the tracking number for any typos or select one of your recent grievances above.
          </p>
          <button onClick={() => setTrackingNumber('')} className="btn btn-secondary">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="card empty-state" style={{ backgroundColor: '#ffffff' }}>
          <SearchCheck size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Ready to Track</h3>
          <p style={{ marginTop: '0.375rem', fontSize: '0.875rem' }}>
            Enter your unique grievance tracking number above (e.g. GRV-20260921-XXXXX) to view current status and full investigation timeline.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackGrievancePage;
