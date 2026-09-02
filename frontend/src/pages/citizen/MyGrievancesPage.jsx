import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, Filter, PlusCircle, ArrowRight, Inbox, RotateCcw } from 'lucide-react';

export const MyGrievancesPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { showToast } = useToast();

  const fetchGrievances = async () => {
    setIsLoading(true);
    try {
      const res = await grievanceApi.getMy();
      if (res.success && res.data) {
        setGrievances(res.data.grievances || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const filteredGrievances = useMemo(() => {
    return grievances.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.grievance_number.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchPriority = !priorityFilter || item.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [grievances, search, statusFilter, priorityFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>My Grievances</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            View, track, and monitor all civic complaints lodged under your account
          </p>
        </div>
        <Link to="/citizen/submit" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-3 items-center">
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by title or GRV-..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button onClick={handleResetFilters} className="btn btn-outline" style={{ width: '100%' }}>
              <RotateCcw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grievances List / Table */}
      {isLoading ? (
        <LoadingSpinner text="Fetching your grievances..." fullPage={true} />
      ) : filteredGrievances.length === 0 ? (
        <div className="card empty-state">
          <Inbox size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>No Grievances Found</h3>
          <p style={{ marginTop: '0.375rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            {grievances.length === 0
              ? "You haven't filed any grievances yet."
              : 'No grievances match the current filter criteria.'}
          </p>
          {grievances.length === 0 ? (
            <Link to="/citizen/submit" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Submit a Grievance</span>
            </Link>
          ) : (
            <button onClick={handleResetFilters} className="btn btn-secondary">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Grievance Summary</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Filed</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{g.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {g.category_name} {g.location && `• 📍 ${g.location}`}
                      </div>
                    </td>
                    <td>{g.department_name}</td>
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
                      <Link to={`/grievances/${g.id}`} className="btn btn-secondary btn-sm">
                        <span>Details</span>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGrievancesPage;
