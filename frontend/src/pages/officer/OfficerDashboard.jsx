import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { officerApi } from '../../api/officer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ClipboardList,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOfficerData = async () => {
      try {
        const res = await officerApi.getDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfficerData();
  }, [showToast]);

  if (isLoading) {
    return <LoadingSpinner text="Loading officer workload metrics..." fullPage={true} />;
  }

  const stats = data?.stats || {
    total_assigned: 0,
    in_progress: 0,
    resolved: 0,
    assigned_pending: 0,
    by_priority: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
  };

  const recentAssigned = data?.recent_assigned || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Officer Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(37, 99, 235, 0.3)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd' }}>
            Officer Operations
          </div>
        </div>
        <h1 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 800 }}>
          Welcome, Officer {user?.name}
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
          Here is your assigned grievance workload and resolution status overview.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-4">
        <StatCard
          title="Total Assigned"
          value={stats.total_assigned}
          icon={ClipboardList}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatCard
          title="Assigned (Pending Review)"
          value={stats.assigned_pending}
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={Play}
          color="#854d0e"
          bg="#fef9c3"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="#059669"
          bg="#ecfdf5"
        />
      </div>

      {/* Priority Breakdown & Workload Table */}
      <div className="grid grid-cols-3 lg-grid-cols-1 gap-6">
        {/* Priority Counts */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header">
            <h3 className="card-title">Priority Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center" style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fee2e2' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} color="var(--danger)" />
                <span style={{ fontWeight: 700, color: '#991b1b' }}>Critical</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#991b1b' }}>{stats.by_priority?.CRITICAL || 0}</span>
            </div>

            <div className="flex justify-between items-center" style={{ padding: '0.75rem 1rem', backgroundColor: '#fff7ed', borderRadius: 'var(--radius-md)', border: '1px solid #ffedd5' }}>
              <span style={{ fontWeight: 700, color: '#c2410c' }}>High</span>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#c2410c' }}>{stats.by_priority?.HIGH || 0}</span>
            </div>

            <div className="flex justify-between items-center" style={{ padding: '0.75rem 1rem', backgroundColor: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #e0f2fe' }}>
              <span style={{ fontWeight: 700, color: '#0369a1' }}>Medium</span>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0369a1' }}>{stats.by_priority?.MEDIUM || 0}</span>
            </div>

            <div className="flex justify-between items-center" style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>Low</span>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#475569' }}>{stats.by_priority?.LOW || 0}</span>
            </div>
          </div>
        </div>

        {/* Assigned Grievances List (Col Span 2) */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Assigned Tasks</h3>
              <p className="card-subtitle">Civic issues assigned to your queue</p>
            </div>
            <Link to="/officer/grievances" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentAssigned.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck size={44} className="empty-state-icon" />
              <h4 style={{ fontWeight: 700 }}>No Grievances Assigned</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Your task queue is currently empty.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssigned.map((g) => (
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
                      <td>
                        <PriorityBadge priority={g.priority} />
                      </td>
                      <td>
                        <StatusBadge status={g.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/grievances/${g.id}`} className="btn btn-secondary btn-sm">
                          <span>Inspect</span>
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
