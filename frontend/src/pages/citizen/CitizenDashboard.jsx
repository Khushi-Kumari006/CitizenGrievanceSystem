import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Clock,
  Play,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Inbox,
  AlertCircle,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
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

    fetchDashboardData();
  }, [showToast]);

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard data..." fullPage={true} />;
  }

  // Calculate quick stats
  const totalCount = grievances.length;
  const pendingCount = grievances.filter((g) => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(g.status)).length;
  const inProgressCount = grievances.filter((g) => g.status === 'IN_PROGRESS').length;
  const resolvedCount = grievances.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status)).length;

  const recentGrievances = grievances.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div>
          <h1 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 800 }}>
            Hello, {user?.name || 'Citizen'}!
          </h1>
          <p style={{ color: '#bfdbfe', marginTop: '0.375rem', fontSize: '0.9375rem', maxWidth: '600px' }}>
            Track the status of your municipal complaints, submit new civic requests, or communicate directly with assigned officials.
          </p>
        </div>
        <Link to="/citizen/submit" className="btn btn-lg" style={{ backgroundColor: '#ffffff', color: '#1e40af', fontWeight: 700 }}>
          <PlusCircle size={20} />
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 lg-grid-cols-2 md-grid-cols-1 gap-4">
        <StatCard
          title="Total Submitted"
          value={totalCount}
          icon={FileText}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatCard
          title="Pending / Under Review"
          value={pendingCount}
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Play}
          color="#854d0e"
          bg="#fef9c3"
        />
        <StatCard
          title="Resolved Grievances"
          value={resolvedCount}
          icon={CheckCircle2}
          color="#059669"
          bg="#ecfdf5"
        />
      </div>

      {/* Recent Grievances Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Grievances</h2>
            <p className="card-subtitle">Latest civic issues submitted by you</p>
          </div>
          <Link to="/citizen/grievances" className="btn btn-outline btn-sm">
            <span>View All ({totalCount})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentGrievances.length === 0 ? (
          <div className="empty-state">
            <Inbox size={44} className="empty-state-icon" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>No Grievances Lodged Yet</h3>
            <p style={{ marginTop: '0.375rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              You haven't submitted any civic grievances yet. Click below to file your first complaint.
            </p>
            <Link to="/citizen/submit" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Submit a Grievance</span>
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Filed</th>
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
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{g.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.category_name}</div>
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
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
