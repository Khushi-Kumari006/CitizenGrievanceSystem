import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { commentApi } from '../../api/comments';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Star,
  CheckCircle2,
  MessageSquareHeart,
  Send,
  Building2,
  Calendar,
  Sparkles,
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
  const selectedIdFromUrl = searchParams.get('id');

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
  const navigate = useNavigate();

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
      const ratingLabel = RATING_LABELS[rating] || `${rating}/5 Stars`;
      const feedbackMessage = `⭐ Citizen Feedback (${rating}/5 Stars)\n` +
        `Rating: ${ratingLabel}\n` +
        `Quality of resolution: ${satisfactionAspects.quality ? 'Satisfactory' : 'Needs improvement'}\n` +
        `Resolution speed: ${satisfactionAspects.timeliness ? 'On time' : 'Delayed'}\n` +
        `Remarks: ${remarks.trim()}`;

      // Permanently record feedback in the grievance's comment discussion thread
      await commentApi.addComment(activeGrievance.id, { message: feedbackMessage });

      // Save locally
      const feedbackData = {
        rating,
        ratingLabel,
        remarks: remarks.trim(),
        submittedAt: new Date().toISOString(),
      };
      saveFeedbackRecord(activeGrievance.id, feedbackData);
      setFeedbackStore(getFeedbackStore());

      showToast('Thank you! Your feedback has been submitted successfully.', 'success');
      setRemarks('');
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading resolved grievances..." fullPage={true} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Citizen Resolution Feedback</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Rate the timeliness and quality of municipal grievance redressal to help maintain public service excellence
        </p>
      </div>

      {resolvedGrievances.length === 0 ? (
        <div className="card empty-state">
          <Inbox size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Resolved Grievances Yet</h3>
          <p style={{ marginTop: '0.375rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Feedback can only be provided for grievances that have been marked as RESOLVED or CLOSED by municipal authorities.
          </p>
          <Link to="/citizen/grievances" className="btn btn-primary">
            <span>View My Grievances</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 lg-grid-cols-1 gap-6">
          {/* Left Column: Select Resolved Grievance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Select Resolved Grievance ({resolvedGrievances.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resolvedGrievances.map((g) => {
                const hasProvided = Boolean(feedbackStore[g.id]);
                const isSelected = String(g.id) === String(selectedGrievanceId);

                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGrievanceId(String(g.id))}
                    className="card"
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                        {g.grievance_number}
                      </span>
                      {hasProvided ? (
                        <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>
                          Feedback Sent
                        </span>
                      ) : (
                        <span className="badge badge-under_review" style={{ fontSize: '0.65rem' }}>
                          Pending Feedback
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      {g.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {g.department_name} • {new Date(g.resolved_at || g.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Feedback Submission Form / Display */}
          <div className="card" style={{ gridColumn: 'span 2', padding: '1.75rem' }}>
            {activeGrievance ? (
              <div>
                {/* Grievance Summary Header */}
                <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                        {activeGrievance.grievance_number}
                      </span>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                        {activeGrievance.title}
                      </h2>
                    </div>
                    <StatusBadge status={activeGrievance.status} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Department: <strong>{activeGrievance.department_name}</strong> | Assigned Officer: <strong>{activeGrievance.officer_name || 'Designated Inspector'}</strong>
                  </div>
                </div>

                {existingFeedback ? (
                  /* Already Submitted Feedback Display */
                  <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                    <div className="flex items-center gap-2" style={{ color: '#065f46', marginBottom: '0.75rem' }}>
                      <CheckCircle2 size={22} />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Feedback Recorded</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={22}
                          color={s <= existingFeedback.rating ? '#f59e0b' : '#cbd5e1'}
                          fill={s <= existingFeedback.rating ? '#f59e0b' : 'none'}
                        />
                      ))}
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#065f46', marginLeft: '0.5rem' }}>
                        {existingFeedback.ratingLabel}
                      </span>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', fontSize: '0.875rem', lineHeight: 1.5, color: '#1f2937' }}>
                      <strong>Your Remarks:</strong> "{existingFeedback.remarks}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.75rem' }}>
                      Recorded on {new Date(existingFeedback.submittedAt).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  /* Feedback Input Form */
                  <form onSubmit={handleSubmitFeedback}>
                    {/* 5-Star Rating Widget */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.9375rem' }}>
                        Overall Satisfaction Rating <span className="required">*</span>
                      </label>
                      <div className="star-rating" style={{ margin: '0.5rem 0' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="star-btn"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            title={`${star} Star`}
                          >
                            <Star
                              size={32}
                              color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                              fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {RATING_LABELS[hoverRating || rating]}
                      </div>
                    </div>

                    {/* Specific Service Metrics */}
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label className="form-label">Redressal Performance Criteria</label>
                      <div className="grid grid-cols-3 md-grid-cols-1 gap-3" style={{ marginTop: '0.375rem' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: satisfactionAspects.quality ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={satisfactionAspects.quality}
                            onChange={(e) =>
                              setSatisfactionAspects((prev) => ({ ...prev, quality: e.target.checked }))
                            }
                          />
                          <span>Proper Resolution Quality</span>
                        </label>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: satisfactionAspects.timeliness ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={satisfactionAspects.timeliness}
                            onChange={(e) =>
                              setSatisfactionAspects((prev) => ({ ...prev, timeliness: e.target.checked }))
                            }
                          />
                          <span>Timely Resolution</span>
                        </label>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: satisfactionAspects.communication ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={satisfactionAspects.communication}
                            onChange={(e) =>
                              setSatisfactionAspects((prev) => ({ ...prev, communication: e.target.checked }))
                            }
                          />
                          <span>Officer Professionalism</span>
                        </label>
                      </div>
                    </div>

                    {/* Remarks Textarea */}
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label className="form-label">
                        Detailed Remarks & Suggestions <span className="required">*</span>
                      </label>
                      <textarea
                        className="form-textarea"
                        rows={4}
                        placeholder="Describe your experience: Was the issue resolved completely? Any suggestions for the department?"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || !remarks.trim()}>
                        <Send size={18} />
                        <span>{isSubmitting ? 'Submitting Feedback...' : 'Submit Official Feedback'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>Please select a resolved grievance from the list to leave your feedback.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
