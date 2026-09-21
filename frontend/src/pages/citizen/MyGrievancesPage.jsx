import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { categoryApi } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  Inbox,
  RotateCcw,
  Calendar,
  Layers,
  SearchCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const MyGrievancesPage = () => {
  const [searchParams] = useSearchParams();
  const [grievances, setGrievances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH

  const { showToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [grvRes, catRes] = await Promise.all([
        grievanceApi.getMy(),
        categoryApi.getAll({ active: true }),
      ]);

      if (grvRes.success && grvRes.data) {
        setGrievances(grvRes.data.grievances || []);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredGrievances = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return grievances.filter((item) => {
      // 1. Text / Tracking # Search
      const matchSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.grievance_number.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
        (item.department_name && item.department_name.toLowerCase().includes(search.toLowerCase()));

      // 2. Status Filter
      const matchStatus = !statusFilter || item.status === statusFilter;

      // 3. Category Filter
      const matchCategory = !categoryFilter || item.category_name === categoryFilter || String(item.category_id) === String(categoryFilter);

      // 4. Priority Filter
      const matchPriority = !priorityFilter || item.priority === priorityFilter;

      // 5. Date Filter
      let matchDate = true;
      if (item.created_at) {
        const itemTime = new Date(item.created_at).getTime();
        if (dateFilter === 'TODAY') {
          matchDate = itemTime >= todayStart;
        } else if (dateFilter === 'WEEK') {
          matchDate = itemTime >= weekAgo;
        } else if (dateFilter === 'MONTH') {
          matchDate = itemTime >= monthAgo;
        }
      }

      return matchSearch && matchStatus && matchCategory && matchPriority && matchDate;
    });
  }, [grievances, search, statusFilter, categoryFilter, priorityFilter, dateFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
    setDateFilter('ALL');
  };

  // Quick count calculations for filter chips
  const totalCount = grievances.length;
  const pendingCount = grievances.filter((g) => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(g.status)).length;
  const inProgressCount = grievances.filter((g) => g.status === 'IN_PROGRESS').length;
  const resolvedCount = grievances.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>My Grievances</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            View, track, filter, and monitor all civic complaints lodged under your account
          </p>
        </div>
        <Link to="/citizen/submit" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* Quick Status Chips */}
      <div className="filter-chip-group">
        <button
          className={`filter-chip ${statusFilter === '' ? 'active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          <span>All Grievances</span>
          <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.4rem' }}>
            {totalCount}
          </span>
        </button>
        <button
          className={`filter-chip ${statusFilter === 'SUBMITTED' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'SUBMITTED' ? '' : 'SUBMITTED')}
        >
          <span>Submitted</span>
        </button>
        <button
          className={`filter-chip ${statusFilter === 'UNDER_REVIEW' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'UNDER_REVIEW' ? '' : 'UNDER_REVIEW')}
        >
          <span>Under Review</span>
        </button>
        <button
          className={`filter-chip ${statusFilter === 'ASSIGNED' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'ASSIGNED' ? '' : 'ASSIGNED')}
        >
          <span>Assigned</span>
        </button>
        <button
          className={`filter-chip ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? '' : 'IN_PROGRESS')}
        >
          <span>In Progress</span>
          <span className="badge" style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0.1rem 0.4rem' }}>
            {inProgressCount}
          </span>
        </button>
        <button
          className={`filter-chip ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? '' : 'RESOLVED')}
        >
          <span>Resolved</span>
          <span className="badge" style={{ backgroundColor: '#bbf7d0', color: '#166534', padding: '0.1rem 0.4rem' }}>
            {resolvedCount}
          </span>
        </button>
        <button
          className={`filter-chip ${statusFilter === 'CLOSED' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'CLOSED' ? '' : 'CLOSED')}
        >
          <span>Closed</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid grid-cols-5 lg-grid-cols-2 md-grid-cols-1 gap-3 items-center">
          {/* Search by tracking #, title, description */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search tracking #, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              className="form-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Filed Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
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

      {/* Grievances List Table */}
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrievances.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <Link
                        to={`/citizen/track?number=${g.grievance_number}`}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}
                        title="Click to track in real-time"
                      >
                        {g.grievance_number}
                      </Link>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{g.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/citizen/track?number=${g.grievance_number}`}
                          className="btn btn-outline btn-sm"
                          title="Track Timeline"
                        >
                          <SearchCheck size={14} />
                          <span>Track</span>
                        </Link>
                        {['RESOLVED', 'CLOSED'].includes(g.status) && (
                          <Link
                            to={`/citizen/feedback?id=${g.id}`}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                            title="Rate resolution"
                          >
                            <Star size={14} />
                            <span>Feedback</span>
                          </Link>
                        )}
                        <Link to={`/grievances/${g.id}`} className="btn btn-secondary btn-sm" title="View discussion & details">
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
    </div>
  );
};

export default MyGrievancesPage;
