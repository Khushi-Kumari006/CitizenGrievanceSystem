import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { departmentApi } from '../../api/departments';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, Filter, ArrowRight, RotateCcw, Building2, ClipboardList } from 'lucide-react';

export const AdminGrievancesPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const { showToast } = useToast();

  const fetchGrievancesAndDepts = async () => {
    setIsLoading(true);
    try {
      const [grievanceRes, deptRes] = await Promise.all([
        grievanceApi.getAll(),
        departmentApi.getAll(),
      ]);

      if (grievanceRes.success && grievanceRes.data) {
        setGrievances(grievanceRes.data.grievances || []);
      }
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data.departments || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievancesAndDepts();
  }, []);

  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const matchSearch =
        !search.trim() ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.grievance_number.toLowerCase().includes(search.toLowerCase()) ||
        (g.citizen_name && g.citizen_name.toLowerCase().includes(search.toLowerCase())) ||
        (g.officer_name && g.officer_name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || g.status === statusFilter;
      const matchPriority = !priorityFilter || g.priority === priorityFilter;
      const matchDept = !deptFilter || String(g.department_id) === String(deptFilter);

      return matchSearch && matchStatus && matchPriority && matchDept;
    });
  }, [grievances, search, statusFilter, priorityFilter, deptFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setDeptFilter('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>All Grievances Records</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Central oversight directory of all municipal issues logged across citizens and departments
        </p>
      </div>

      {/* Filter Bar */}
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
              placeholder="Search title, citizen, officer, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select className="form-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

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

          <div>
            <button onClick={handleResetFilters} className="btn btn-outline" style={{ width: '100%' }}>
              <RotateCcw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grievance Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading system grievance records..." fullPage={true} />
      ) : filteredGrievances.length === 0 ? (
        <div className="card empty-state">
          <ClipboardList size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Grievances Found</h3>
          <p style={{ marginTop: '0.375rem', fontSize: '0.875rem' }}>No complaints match the filter parameters.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Title & Citizen</th>
                  <th>Department</th>
                  <th>Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Filed Date</th>
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
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{g.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        By <strong>{g.citizen_name}</strong> • {g.category_name}
                      </div>
                    </td>
                    <td>{g.department_name}</td>
                    <td>
                      {g.officer_name ? (
                        <span style={{ fontWeight: 600 }}>{g.officer_name}</span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
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

export default AdminGrievancesPage;
