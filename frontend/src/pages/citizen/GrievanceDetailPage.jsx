import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { commentApi } from '../../api/comments';
import { userApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { RoleBadge } from '../../components/common/RoleBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Tags,
  User,
  ShieldCheck,
  MessageSquare,
  History,
  Send,
  UserCheck,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export const GrievanceDetailPage = () => {
  const { id } = useParams();
  const { user, isOfficer, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '' });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Officer Assignment Modal State (Admin)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchGrievanceDetails = useCallback(async () => {
    try {
      const res = await grievanceApi.getById(id);
      if (res.success && res.data?.grievance) {
        setGrievance(res.data.grievance);
        setStatusForm({ status: res.data.grievance.status, remarks: '' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchGrievanceDetails();
  }, [fetchGrievanceDetails]);

  // Handle posting a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await commentApi.addComment(id, { message: newComment.trim() });
      if (res.success) {
        showToast('Comment posted successfully', 'success');
        setNewComment('');
        fetchGrievanceDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle status update
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return;

    setIsUpdatingStatus(true);
    try {
      const res = await grievanceApi.updateStatus(id, {
        status: statusForm.status,
        remarks: statusForm.remarks.trim() || undefined,
      });
      if (res.success) {
        showToast(`Status updated to ${statusForm.status}`, 'success');
        setIsStatusModalOpen(false);
        fetchGrievanceDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open assign officer modal
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const res = await userApi.getAll({ role: 'OFFICER', active: true });
      if (res.success && res.data?.users) {
        setOfficers(res.data.users);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Submit officer assignment
  const handleAssignOfficerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) return;

    setIsAssigning(true);
    try {
      const res = await grievanceApi.assignOfficer(id, {
        officer_id: parseInt(selectedOfficerId, 10),
      });
      if (res.success) {
        showToast('Officer assigned successfully', 'success');
        setIsAssignModalOpen(false);
        fetchGrievanceDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading grievance details..." fullPage={true} />;
  }

  if (!grievance) {
    return (
      <div className="card empty-state" style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <h2>Grievance Not Found</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          The requested grievance record does not exist or you do not have permission to view it.
        </p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navigation and Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Action Controls for Officer/Admin */}
        {(isOfficer || isAdmin) && (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={handleOpenAssignModal} className="btn btn-secondary btn-sm">
                <UserCheck size={16} />
                <span>Assign Officer</span>
              </button>
            )}
            <button onClick={() => setIsStatusModalOpen(true)} className="btn btn-primary btn-sm">
              <RefreshCw size={16} />
              <span>Update Status</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Header Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>
                {grievance.grievance_number}
              </span>
              <StatusBadge status={grievance.status} />
              <PriorityBadge priority={grievance.priority} />
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-main)' }}>{grievance.title}</h1>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <div>Filed on: <strong>{new Date(grievance.created_at).toLocaleString()}</strong></div>
            {grievance.resolved_at && (
              <div style={{ color: 'var(--success)', fontWeight: 600, marginTop: '0.25rem' }}>
                Resolved on: {new Date(grievance.resolved_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Metadata Details Pills Grid */}
        <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-3" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Building2 size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{grievance.department_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tags size={18} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Category</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{grievance.category_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User size={18} color="#0284c7" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Citizen / Complainant</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{grievance.citizen_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={18} color="#059669" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Officer</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {grievance.officer_name ? grievance.officer_name : <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Description */}
        <div style={{ marginTop: '1.5rem' }}>
          {grievance.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <MapPin size={16} color="var(--danger)" />
              <span><strong>Location:</strong> {grievance.location}</span>
            </div>
          )}

          <div style={{ marginTop: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Description</h3>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                fontSize: '0.9375rem',
              }}
            >
              {grievance.description}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Comments Thread (Left) & Status Audit Timeline (Right) */}
      <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
        {/* Comments Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} color="var(--primary)" />
              <h3 className="card-title">Discussion & Updates ({grievance.comments?.length || 0})</h3>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Write a message, inquiry, or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmittingComment}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingComment || !newComment.trim()}>
                <Send size={14} />
                <span>{isSubmittingComment ? 'Posting...' : 'Post Message'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!grievance.comments || grievance.comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No messages yet. Start the conversation above.
              </div>
            ) : (
              grievance.comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{c.user_name}</span>
                      <RoleBadge role={c.user_role} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {c.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Audit Timeline Section */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <History size={20} color="var(--primary)" />
              <h3 className="card-title">Status Audit Trail</h3>
            </div>
          </div>

          <div className="timeline">
            {grievance.status_history?.map((h, index) => (
              <div key={h.id || index} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <StatusBadge status={h.new_status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(h.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    Updated by <strong>{h.changed_by_name}</strong> ({h.changed_by_role})
                  </div>
                  {h.remarks && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{h.remarks}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Update Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Grievance Status"
        footer={
          <>
            <button onClick={() => setIsStatusModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleUpdateStatusSubmit} className="btn btn-primary" disabled={isUpdatingStatus}>
              {isUpdatingStatus ? 'Saving...' : 'Update Status'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateStatusSubmit}>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select
              className="form-select"
              value={statusForm.status}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Audit Remarks / Justification</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Work started by technical maintenance team..."
              value={statusForm.remarks}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, remarks: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Officer (Admin) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Officer to Grievance"
        footer={
          <>
            <button onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAssignOfficerSubmit} className="btn btn-primary" disabled={isAssigning || !selectedOfficerId}>
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAssignOfficerSubmit}>
          <div className="form-group">
            <label className="form-label">Select Designated Officer</label>
            <select
              className="form-select"
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
            >
              <option value="">-- Choose Officer --</option>
              {officers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.name} ({off.email}) - {off.department_name || 'General'}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GrievanceDetailPage;
