import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  ShieldCheck,
  MapPin,
  Calendar,
  History,
  CheckCircle2,
  MessageSquare,
  Star,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';

const STEP_STAGES = [
  { key: 'SUBMITTED', label: 'Submitted', num: 1 },
  { key: 'UNDER_REVIEW', label: 'Under Review', num: 2 },
  { key: 'ASSIGNED', label: 'Assigned', num: 3 },
  { key: 'IN_PROGRESS', label: 'In Progress', num: 4 },
  { key: 'RESOLVED', label: 'Resolved', num: 5 },
];

export const TrackGrievancePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('number') || searchParams.get('trackingNumber') || '';
  const [trackingNumber, setTrackingNumber] = useState(initialQuery);
  const [grievance, setGrievance] = useState(null);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const { showToast } = useToast();

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
      showToast('Please enter a valid tracking number or ID', 'warning');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          Track Grievance Status
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
          Inspect investigation progress, officer assignments, and chronological status history
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <label className="form-label" style={{ marginBottom: '0.45rem' }}>
            <span>Enter Grievance Tracking Code or ID</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-placeholder)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{
                  paddingLeft: '2.4rem',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
                placeholder="e.g. GRV-2026-..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <SearchCheck size={16} />
              <span>{isLoading ? 'Tracking...' : 'Search'}</span>
            </button>
          </div>
        </form>

        {/* Quick Recent Chips */}
        {recentGrievances.length > 0 && (
          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-placeholder)',
                marginBottom: '0.4rem',
                letterSpacing: '0.04em',
              }}
            >
              Your Recent Grievances
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {recentGrievances.map((rg) => (
                <button
                  key={rg.id}
                  type="button"
                  onClick={() => handleChipClick(rg.trackingNumber)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  <span>{rg.trackingNumber}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({rg.status})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isLoading && <LoadingSpinner text="Locating grievance records..." />}

      {!isLoading && hasSearched && !grievance && (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <AlertCircle size={28} color="var(--status-danger-text)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
            No Grievance Record Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            No grievance matching tracking code "<strong>{trackingNumber}</strong>" was found in the database.
          </p>
        </div>
      )}

      {!isLoading && grievance && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Progress Timeline Stepper Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="card-title">Resolution Lifecycle</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {grievance.trackingNumber}
                </span>
              </div>
              <StatusBadge status={grievance.status} />
            </div>

            <div className="card-body">
              {grievance.status === 'REJECTED' ? (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--status-danger-bg)',
                    border: '1px solid var(--status-danger-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--status-danger-text)',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>
                    This grievance was marked as <strong>REJECTED</strong>. Check the audit timeline remarks below for the rejection justification.
                  </span>
                </div>
              ) : (
                <div className="track-stepper">
                  {STEP_STAGES.map((step, idx) => {
                    const isCompleted = activeIndex > idx || (activeIndex === 4 && idx === 4);
                    const isCurrent = activeIndex === idx && activeIndex !== 4;
                    const nodeClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';

                    return (
                      <div key={step.key} className={`track-step-node ${nodeClass}`}>
                        <div className="track-circle">
                          {isCompleted ? <CheckCircle2 size={16} /> : step.num}
                        </div>
                        <div className="track-label">{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Grievance Summary & Parameters Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Grievance Overview</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Link to={`/grievances/${grievance.id}`} className="btn btn-secondary btn-sm">
                  <MessageSquare size={13} />
                  <span>Comments Thread</span>
                </Link>
                {['RESOLVED', 'CLOSED'].includes(grievance.status) && (
                  <Link
                    to={`/citizen/feedback?grievanceId=${grievance.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <Star size={13} />
                    <span>Submit Feedback</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="card-body">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                {grievance.title}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {grievance.description}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building2 size={13} /> Department
                  </span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                    {grievance.department?.name || 'General Administration'}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Tags size={13} /> Category
                  </span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                    {grievance.category?.name || 'General Issue'}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted font-medium">Priority Classification</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <PriorityBadge priority={grievance.priority} />
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> Lodged On
                  </span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                    {new Date(grievance.createdAt).toLocaleString()}
                  </div>
                </div>

                {grievance.location && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} /> Location Landmark
                    </span>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                      {grievance.location}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Officer Block if present */}
          {grievance.assignedOfficer && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span className="card-title">Assigned Inspecting Officer</span>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                    {grievance.assignedOfficer.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {grievance.assignedOfficer.email} • {grievance.department?.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Change Audit Trail */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={16} color="var(--primary)" />
                <span className="card-title">Chronological Audit History</span>
              </div>
            </div>

            <div className="card-body">
              {grievance.statusHistory && grievance.statusHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {grievance.statusHistory.map((item, index) => (
                    <div
                      key={item.id || index}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        paddingBottom: '1rem',
                        borderBottom:
                          index < grievance.statusHistory.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        <StatusBadge status={item.to_status || item.newStatus || item.status} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                            Status updated by {item.changed_by_name || item.user?.name || 'Department Officer'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(item.created_at || item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {item.remarks && (
                          <div
                            style={{
                              marginTop: '0.35rem',
                              padding: '0.5rem 0.75rem',
                              backgroundColor: 'var(--bg-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              color: 'var(--text-main)',
                            }}
                          >
                            {item.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1rem 0' }}>
                  Grievance is currently in registered state. Investigation remarks will be logged here as officers process the case.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackGrievancePage;
