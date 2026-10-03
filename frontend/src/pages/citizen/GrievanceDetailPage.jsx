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
  Star,
  Paperclip,
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

  // Fetch officers for assignment
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const res = await userApi.getAll({ role: 'OFFICER' });
      if (res.success && res.data?.users) {
        setOfficers(res.data.users);
      }
    } catch (err) {
      showToast('Failed to load officers: ' + err.message, 'error');
    }
  };

  // Handle officer assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) return;

    setIsAssigning(true);
    try {
      const res = await grievanceApi.assignOfficer(id, {
        officer_id: parseInt(selectedOfficerId, 10),
      });

      if (res.success) {
        showToast('Grievance assigned to officer successfully', 'success');
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
    return <LoadingSpinner text="Loading grievance details..." fullPage />;
  }

  if (!grievance) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
          Grievance Not Found
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.35rem' }}>
          The requested grievance record does not exist or you do not have permission to view it.
        </p>
        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  const isResolved = ['RESOLVED', 'CLOSED'].includes(grievance.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1020px', margin: '0 auto' }}>
      {/* Top Navigation Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            to={`/citizen/track?trackingNumber=${encodeURIComponent(grievance.trackingNumber)}`}
            className="btn btn-outline btn-sm"
          >
            <span>Track Progress</span>
          </Link>

          {(isOfficer || isAdmin) && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={13} />
              <span>Update Status</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleOpenAssignModal}
              className="btn btn-primary btn-sm"
            >
              <UserCheck size={13} />
              <span>Assign Officer</span>
            </button>
          )}

          {isResolved && user?.role === 'CITIZEN' && (
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

      {/* Main Dossier Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
              {grievance.trackingNumber}
            </span>
            <span className="badge badge-subtle">ID #{grievance.id}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PriorityBadge priority={grievance.priority} />
            <StatusBadge status={grievance.status} />
          </div>
        </div>

        <div className="card-body">
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
            {grievance.title}
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
            {grievance.description}
          </p>

          {/* Grievance Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building2 size={13} /> Responsible Department
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
                {grievance.category?.name || 'General'}
              </div>
            </div>

            <div>
              <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={13} /> Lodged By
              </span>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                {grievance.citizen?.name || 'Citizen'}
              </div>
            </div>

            <div>
              <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={13} /> Assigned Officer
              </span>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                {grievance.assignedOfficer?.name || 'Unassigned'}
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

            {grievance.attachmentPath && (
              <div style={{ gridColumn: 'span 2' }}>
                <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Paperclip size={13} /> Evidence Attachment
                </span>
                <div style={{ fontSize: '0.84rem', color: 'var(--primary)', marginTop: '0.15rem' }}>
                  <a
                    href={`/${grievance.attachmentPath}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    View Attachment Document
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discussion & Officer Remarks Thread */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} color="var(--primary)" />
            <span className="card-title">Case Discussion & Officer Communication</span>
          </div>
          <span className="badge badge-subtle">
            {grievance.comments ? grievance.comments.length : 0} messages
          </span>
        </div>

        <div className="card-body">
          {/* Comments List */}
          {grievance.comments && grievance.comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {grievance.comments.map((cmt) => {
                const isMine = cmt.user?.id === user?.id;
                const isOfficial = ['OFFICER', 'ADMIN'].includes(cmt.user?.role);

                return (
                  <div
                    key={cmt.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isOfficial ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      border: `1px solid ${isOfficial ? 'var(--border-strong)' : 'var(--border-color)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-heading)' }}>
                          {cmt.user?.name || 'User'}
                        </span>
                        <RoleBadge role={cmt.user?.role} />
                        {isMine && <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>You</span>}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(cmt.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {cmt.message}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1rem 0' }}>
              No messages posted on this case yet. Use the box below to send questions or remarks.
            </p>
          )}

          {/* New Comment Form */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type your message or follow-up question here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmittingComment}
            />
            <button type="submit" className="btn btn-primary" disabled={isSubmittingComment || !newComment.trim()}>
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Status History Audit Log */}
      {grievance.statusHistory && grievance.statusHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={16} color="var(--primary)" />
              <span className="card-title">Audit Trail & Inspection Log</span>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Updated Status</th>
                  <th>Changed By</th>
                  <th>Remarks / Notes</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {grievance.statusHistory.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>
                      <StatusBadge status={item.to_status || item.newStatus || item.status} />
                    </td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {item.changed_by_name || item.user?.name || 'Department Officer'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {item.remarks || 'No remarks provided'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at || item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update Modal (Officer/Admin) */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Grievance Status"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleUpdateStatusSubmit}
              disabled={isUpdatingStatus}
            >
              <CheckCircle size={14} />
              <span>{isUpdatingStatus ? 'Updating...' : 'Confirm Update'}</span>
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="status-select">
              <span>Select New Status</span>
              <span className="form-label-required">*</span>
            </label>
            <select
              id="status-select"
              className="form-select"
              value={statusForm.status}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status-remarks">
              <span>Investigation Remarks / Action Taken</span>
            </label>
            <textarea
              id="status-remarks"
              rows={3}
              className="form-textarea"
              placeholder="Enter details of field inspection, repair executed, or reason for status change..."
              value={statusForm.remarks}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, remarks: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* Assign Officer Modal (Admin) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Field Officer"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAssignSubmit}
              disabled={isAssigning || !selectedOfficerId}
            >
              <UserCheck size={14} />
              <span>{isAssigning ? 'Assigning...' : 'Assign Officer'}</span>
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="officer-select">
            <span>Select Municipal Officer</span>
            <span className="form-label-required">*</span>
          </label>
          <select
            id="officer-select"
            className="form-select"
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
          >
            <option value="">-- Choose Officer --</option>
            {officers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.name} ({off.email}) - {off.department?.name || 'Department'}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default GrievanceDetailPage;
