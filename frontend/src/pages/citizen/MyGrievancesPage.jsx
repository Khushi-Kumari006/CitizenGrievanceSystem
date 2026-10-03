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
  PlusCircle,
  RotateCcw,
  Star,
  Layers,
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
  const [dateFilter, setDateFilter] = useState('ALL');

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredGrievances = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return grievances.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
        (item.department?.name && item.department.name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || item.status === statusFilter;

      const matchCategory =
        !categoryFilter ||
        item.category?.name === categoryFilter ||
        String(item.categoryId) === String(categoryFilter);

      const matchPriority = !priorityFilter || item.priority === priorityFilter;

      let matchDate = true;
      if (item.createdAt) {
        const itemTime = new Date(item.createdAt).getTime();
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

  const totalCount = grievances.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            My Grievances
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
            Browse, filter, and track all complaints registered under your account
          </p>
        </div>
        <Link to="/citizen/submit" className="btn btn-primary">
          <PlusCircle size={15} />
          <span>Lodge Grievance</span>
        </Link>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Status Tabs */}
          <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>
            <div className="filter-chip-group">
              <button
                className={`filter-chip ${statusFilter === '' ? 'active' : ''}`}
                onClick={() => setStatusFilter('')}
              >
                <span>All ({totalCount})</span>
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
              </button>
              <button
                className={`filter-chip ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? '' : 'RESOLVED')}
              >
                <span>Resolved</span>
              </button>
              <button
                className={`filter-chip ${statusFilter === 'CLOSED' ? 'active' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'CLOSED' ? '' : 'CLOSED')}
              >
                <span>Closed</span>
              </button>
            </div>
          </div>

          {/* Secondary filter selectors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            {/* Search input */}
            <div style={{ position: 'relative', gridColumn: 'span 1' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                placeholder="Search title, tracking #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={14}
                color="var(--text-placeholder)"
                style={{
                  position: 'absolute',
                  left: '0.7rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>

            {/* Category */}
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority */}
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

            {/* Date filter */}
            <select
              className="form-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>

            {/* Reset */}
            {(search || statusFilter || categoryFilter || priorityFilter || dateFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="btn btn-outline btn-sm"
                style={{ height: '36px' }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grievances Table / Content */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="card-title">Grievance Records</span>
            <span className="badge badge-subtle">{filteredGrievances.length} displayed</span>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Fetching your grievances..." />
        ) : filteredGrievances.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              No grievances found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {search || statusFilter || categoryFilter || priorityFilter
                ? 'Try adjusting your filters or search query.'
                : 'You have not registered any grievances yet.'}
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {(search || statusFilter || categoryFilter || priorityFilter) && (
                <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                  Clear Filters
                </button>
              )}
              <Link to="/citizen/submit" className="btn btn-primary btn-sm">
                <PlusCircle size={14} />
                <span>Lodge Grievance</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Title & Description</th>
                  <th>Department & Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Lodged</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrievances.map((item) => {
                  const isResolved = ['RESOLVED', 'CLOSED'].includes(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>
                          {item.trackingNumber}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-heading)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '0.1rem',
                          }}
                        >
                          {item.description}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-heading)' }}>
                          {item.department?.name || 'Assigned Dept'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.category?.name || 'General'}
                        </div>
                      </td>
                      <td>
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <Link
                            to={`/citizen/track?trackingNumber=${encodeURIComponent(item.trackingNumber)}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Track
                          </Link>
                          <Link
                            to={`/grievances/${item.id}`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Details
                          </Link>
                          {isResolved && (
                            <Link
                              to={`/citizen/feedback?grievanceId=${item.id}`}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--primary)' }}
                              title="Submit Resolution Feedback"
                            >
                              <Star size={12} />
                              <span>Feedback</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGrievancesPage;
