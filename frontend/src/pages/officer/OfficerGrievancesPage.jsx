import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { officerApi } from '../../api/officer';
import { grievanceApi } from '../../api/grievances';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Search, RefreshCw, ArrowRight, ClipboardList, RotateCcw } from 'lucide-react';

export const OfficerGrievancesPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Status update modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [updateStatusForm, setUpdateStatusForm] = useState({ status: '', remarks: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const { showToast } = useToast();

  const fetchGrievances = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await officerApi.getAssignedGrievances();
      if (res.success && res.data) {
        setGrievances(res.data.grievances || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const matchSearch =
        !search.trim() ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.grievance_number.toLowerCase().includes(search.toLowerCase()) ||
        (g.citizen_name && g.citizen_name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || g.status === statusFilter;
      const matchPriority = !priorityFilter || g.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [grievances, search, statusFilter, priorityFilter]);

  const handleOpenStatusModal = (grievance) => {
    setSelectedGrievance(grievance);
    setUpdateStatusForm({ status: grievance.status, remarks: '' });
    setIsModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrievance || !updateStatusForm.status) return;

    setIsUpdating(true);
    try {
      const res = await grievanceApi.updateStatus(selectedGrievance.id, {
        status: updateStatusForm.status,
        remarks: updateStatusForm.remarks.trim() || undefined,
      });

      if (res.success) {
        showToast(`Status updated to ${updateStatusForm.status}`, 'success');
        setIsModalOpen(false);
        fetchGrievances();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Assigned Grievances</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Inspect, manage, and transition the status of municipal complaints assigned to your jurisdiction
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-3 items-center">
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by title, number, citizen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <LoadingSpinner text="Fetching assigned task queue..." fullPage={true} />
      ) : filteredGrievances.length === 0 ? (
        <div className="card empty-state">
          <ClipboardList size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Assigned Grievances</h3>
          <p style={{ marginTop: '0.375rem', fontSize: '0.875rem' }}>No complaints found matching current filter criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Grievance Summary</th>
                  <th>Citizen Name</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Filed On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrievances.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {g.grievance_number}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 700 }}>{g.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {g.category_name} {g.location && `• 📍 ${g.location}`}
                      </div>
                    </td>
                    <td>{g.citizen_name}</td>
                    <td>
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td>
                      <StatusBadge status={g.status} />
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(g.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenStatusModal(g)}
                          className="btn btn-outline btn-sm"
                          title="Quick Status Update"
                        >
                          <RefreshCw size={14} />
                          <span>Status</span>
                        </button>
                        <Link to={`/grievances/${g.id}`} className="btn btn-secondary btn-sm">
                          <span>Details</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Quick Status Update */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update Status: ${selectedGrievance?.grievance_number || ''}`}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleStatusSubmit} className="btn btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Apply Status Change'}
            </button>
          </>
        }
      >
        <form onSubmit={handleStatusSubmit}>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select
              className="form-select"
              value={updateStatusForm.status}
              onChange={(e) => setUpdateStatusForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Audit Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Field inspection completed, work crew assigned..."
              value={updateStatusForm.remarks}
              onChange={(e) => setUpdateStatusForm((prev) => ({ ...prev, remarks: e.target.value }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OfficerGrievancesPage;
