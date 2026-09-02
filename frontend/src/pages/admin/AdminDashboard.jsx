import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  Users,
  Shield,
  Building2,
  Tags,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await adminApi.getDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDashboard();
  }, [showToast]);

  if (isLoading) {
    return <LoadingSpinner text="Compiling administrative metrics and analytics..." fullPage={true} />;
  }

  const overview = data?.overview || {
    total_grievances: 0,
    total_users: 0,
    total_citizens: 0,
    total_officers: 0,
    total_admins: 0,
    total_departments: 0,
    total_categories: 0,
  };

  const byStatus = data?.grievances_by_status || {};
  const byPriority = data?.grievances_by_priority || {};
  const byDepartment = data?.grievances_by_department || [];
  const recentGrievances = data?.recent_grievances || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ padding: '0.25rem 0.625rem', backgroundColor: 'rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#c7d2fe' }}>
            System Administrator Control Center
          </span>
        </div>
        <h1 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 800 }}>
          Civic Oversight & Analytics Dashboard
        </h1>
        <p style={{ color: '#c7d2fe', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          Comprehensive city-wide analytics, department resolution rates, and user administration metrics.
        </p>
      </div>

      {/* Top Level Metric Stats */}
      <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-4">
        <StatCard
          title="Total Complaints Filed"
          value={overview.total_grievances}
          icon={BarChart3}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatCard
          title="Registered Citizens"
          value={overview.total_citizens}
          icon={Users}
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          title="Active Officers"
          value={overview.total_officers}
          icon={Shield}
          color="#6366f1"
          bg="#eef2ff"
        />
        <StatCard
          title="Civic Departments"
          value={overview.total_departments}
          icon={Building2}
          color="#059669"
          bg="#ecfdf5"
        />
      </div>

      {/* Status Breakdown Row */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Grievances by Status</h3>
            <p className="card-subtitle">Current distribution of all logged civic complaints</p>
          </div>
        </div>

        <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-3">
          <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: 'var(--radius-md)', border: '1px solid #c7d2fe' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#3730a3' }}>Submitted</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3730a3', marginTop: '0.25rem' }}>
              {byStatus.SUBMITTED || 0}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400e' }}>Under Review / Assigned</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#92400e', marginTop: '0.25rem' }}>
              {(byStatus.UNDER_REVIEW || 0) + (byStatus.ASSIGNED || 0)}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#fef9c3', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#854d0e' }}>In Progress</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#854d0e', marginTop: '0.25rem' }}>
              {byStatus.IN_PROGRESS || 0}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#166534' }}>Resolved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', marginTop: '0.25rem' }}>
              {byStatus.RESOLVED || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Department Breakdown (Left) & Priority Breakdown (Right) */}
      <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
        {/* Department Volume */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Volume by Department</h3>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>Complaints Count</th>
                </tr>
              </thead>
              <tbody>
                {byDepartment.map((dept) => (
                  <tr key={dept.department_id}>
                    <td style={{ fontWeight: 600 }}>{dept.department_name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                      {dept.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Priority Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center" style={{ padding: '0.875rem 1rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: 700, color: '#991b1b' }}>Critical Emergency</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b' }}>{byPriority.CRITICAL || 0}</span>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '0.875rem 1rem', backgroundColor: '#ffedd5', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: 700, color: '#c2410c' }}>High Priority</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c2410c' }}>{byPriority.HIGH || 0}</span>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '0.875rem 1rem', backgroundColor: '#e0f2fe', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: 700, color: '#0369a1' }}>Medium Priority</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0369a1' }}>{byPriority.MEDIUM || 0}</span>
            </div>
            <div className="flex justify-between items-center" style={{ padding: '0.875rem 1rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>Low Priority</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569' }}>{byPriority.LOW || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Grievances Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent System-Wide Grievances</h3>
            <p className="card-subtitle">Live stream of latest citizen submissions across all civic wards</p>
          </div>
          <Link to="/admin/grievances" className="btn btn-outline btn-sm">
            <span>View All Records</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Title</th>
                <th>Citizen</th>
                <th>Department</th>
                <th>Assigned Officer</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentGrievances.map((g) => (
                <tr key={g.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                      {g.grievance_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{g.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.category_name}</div>
                  </td>
                  <td>{g.citizen_name}</td>
                  <td>{g.department_name}</td>
                  <td>{g.officer_name || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Unassigned</span>}</td>
                  <td>
                    <PriorityBadge priority={g.priority} />
                  </td>
                  <td>
                    <StatusBadge status={g.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/grievances/${g.id}`} className="btn btn-secondary btn-sm">
                      <span>View</span>
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
