import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { commentApi } from '../../api/comments';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Star,
  CheckCircle2,
  Send,
  Building2,
  Calendar,
  Inbox,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';

const RATING_LABELS = {
  1: 'Very Dissatisfied (Issue not resolved properly)',
  2: 'Dissatisfied (Resolved but took too long)',
  3: 'Neutral (Average service quality)',
  4: 'Satisfied (Prompt and effective response)',
  5: 'Highly Satisfied (Outstanding municipal service)',
};

const STORAGE_FEEDBACK_KEY = 'civiccare_citizen_feedback_store';

const getFeedbackStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveFeedbackRecord = (grievanceId, feedback) => {
  const store = getFeedbackStore();
  store[grievanceId] = feedback;
  localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(store));
};

export const FeedbackPage = () => {
  const [searchParams] = useSearchParams();
  const selectedIdFromUrl = searchParams.get('id') || searchParams.get('grievanceId');

  const [resolvedGrievances, setResolvedGrievances] = useState([]);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(selectedIdFromUrl || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [satisfactionAspects, setSatisfactionAspects] = useState({
    timeliness: true,
    communication: true,
    quality: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackStore, setFeedbackStore] = useState({});

  const { showToast } = useToast();

  useEffect(() => {
    const fetchResolved = async () => {
      try {
        const res = await grievanceApi.getMy();
        if (res.success && res.data?.grievances) {
          const resolved = res.data.grievances.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status));
          setResolvedGrievances(resolved);
          if (!selectedIdFromUrl && resolved.length > 0) {
            setSelectedGrievanceId(String(resolved[0].id));
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    setFeedbackStore(getFeedbackStore());
    fetchResolved();
  }, [selectedIdFromUrl, showToast]);

  const activeGrievance = resolvedGrievances.find((g) => String(g.id) === String(selectedGrievanceId));
  const existingFeedback = activeGrievance ? feedbackStore[activeGrievance.id] : null;

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!activeGrievance) return;
    if (!remarks.trim()) {
      showToast('Please provide your remarks or suggestions', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackComment = `[CITIZEN SATISFACTION RATING: ${rating}/5 STARS] - ${RATING_LABELS[rating]}\nCriteria Satisfied: ${
        Object.entries(satisfactionAspects)
          .filter(([, v]) => v)
          .map(([k]) => k.toUpperCase())
          .join(', ') || 'NONE'
      }\nCitizen Remarks: ${remarks.trim()}`;

      await commentApi.create(activeGrievance.id, feedbackComment);

      const record = {
        rating,
        label: RATING_LABELS[rating],
        aspects: satisfactionAspects,
        remarks: remarks.trim(),
        submittedAt: new Date().toISOString(),
      };

      saveFeedbackRecord(activeGrievance.id, record);
      setFeedbackStore((prev) => ({ ...prev, [activeGrievance.id]: record }));

      showToast('Thank you! Your feedback has been recorded.', 'success');
      setRemarks('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading resolved cases for feedback..." fullPage />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          Citizen Service Rating & Feedback
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
          Evaluate the quality and speed of municipal grievance resolutions to help improve civic services
        </p>
      </div>

      {resolvedGrievances.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Inbox size={22} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-heading)' }}>
            No Resolved Grievances Available
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.35rem', maxWidth: '440px', margin: '0.35rem auto 1.25rem auto' }}>
            Feedback is enabled for complaints that have been marked as <strong>RESOLVED</strong> or <strong>CLOSED</strong> by municipal officers.
          </p>
          <Link to="/citizen/grievances" className="btn btn-secondary btn-sm">
            <span>View Active Grievances</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Select Grievance to Rate */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Select Resolved Case to Review</span>
              <span className="badge badge-resolved">{resolvedGrievances.length} cases</span>
            </div>

            <div className="card-body">
              <label className="form-label" htmlFor="select-resolved-grv">
                <span>Choose Grievance</span>
              </label>
              <select
                id="select-resolved-grv"
                className="form-select"
                value={selectedGrievanceId}
                onChange={(e) => setSelectedGrievanceId(e.target.value)}
              >
                {resolvedGrievances.map((grv) => (
                  <option key={grv.id} value={grv.id}>
                    [{grv.trackingNumber}] {grv.title} — {grv.department?.name || 'Department'}
                  </option>
                ))}
              </select>

              {activeGrievance && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                      {activeGrievance.title}
                    </div>
                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building2 size={12} /> {activeGrievance.department?.name || 'Department'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> Resolved on {new Date(activeGrievance.updatedAt || activeGrievance.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge status={activeGrievance.status} />
                    <Link to={`/grievances/${activeGrievance.id}`} className="btn btn-outline btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Existing Feedback Notice if already submitted */}
          {existingFeedback && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--primary-subtle)',
                borderColor: 'var(--primary-border)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                    Your Previous Rating: {existingFeedback.rating}/5 Stars
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    "{existingFeedback.remarks}"
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Submitted on {new Date(existingFeedback.submittedAt).toLocaleString()} • You may update your rating below.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rating Form Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Rate Service Quality</span>
            </div>

            <form onSubmit={handleSubmitFeedback} className="card-body">
              {/* Star Rating Strip */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  Select overall satisfaction level
                </div>

                <div style={{ display: 'inline-flex', gap: '0.5rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          color: isFilled ? 'var(--status-pending-text)' : 'var(--border-strong)',
                          transition: 'transform var(--transition-fast)',
                        }}
                        aria-label={`Rate ${starVal} stars`}
                      >
                        <Star
                          size={28}
                          fill={isFilled ? 'var(--status-pending-text)' : 'transparent'}
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-heading)',
                    marginTop: '0.5rem',
                  }}
                >
                  {RATING_LABELS[hoverRating || rating]}
                </div>
              </div>

              {/* Performance Criteria Checklist */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  <span>Which aspects were handled satisfactorily?</span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={satisfactionAspects.timeliness}
                      onChange={(e) =>
                        setSatisfactionAspects((prev) => ({ ...prev, timeliness: e.target.checked }))
                      }
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>Prompt Turnaround Time</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={satisfactionAspects.quality}
                      onChange={(e) =>
                        setSatisfactionAspects((prev) => ({ ...prev, quality: e.target.checked }))
                      }
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>Work Quality & Completeness</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={satisfactionAspects.communication}
                      onChange={(e) =>
                        setSatisfactionAspects((prev) => ({ ...prev, communication: e.target.checked }))
                      }
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>Officer Communication</span>
                  </label>
                </div>
              </div>

              {/* Citizen Remarks Textarea */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="feedback-remarks">
                  <span>Citizen Remarks & Suggestions</span>
                  <span className="form-label-required">*</span>
                </label>
                <textarea
                  id="feedback-remarks"
                  rows={3}
                  className="form-textarea"
                  placeholder="Share your experience regarding this resolution (e.g. Clean repair work, polite officer, or areas of improvement)..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span>Submitting Rating...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{existingFeedback ? 'Update Feedback' : 'Submit Feedback'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
