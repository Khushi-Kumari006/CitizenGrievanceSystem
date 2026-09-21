import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  Droplets,
  Milestone,
  Trash2,
  Zap,
  Lightbulb,
  Waves,
  Sparkles,
  Bus,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  SearchCheck,
} from 'lucide-react';

const CIVIC_SERVICES = [
  {
    name: 'Water Supply',
    icon: Droplets,
    color: '#0284c7',
    bg: '#e0f2fe',
    desc: 'Leakages, low pressure, contaminated water & meter faults',
    dept: 'Water Department',
  },
  {
    name: 'Roads',
    icon: Milestone,
    color: '#b45309',
    bg: '#fef3c7',
    desc: 'Potholes, damaged pathways, speed breakers & resurfacing',
    dept: 'Road Department',
  },
  {
    name: 'Garbage',
    icon: Trash2,
    color: '#059669',
    bg: '#d1fae5',
    desc: 'Uncollected waste, overflowing bins & illegal dump yards',
    dept: 'Sanitation Department',
  },
  {
    name: 'Electricity',
    icon: Zap,
    color: '#d97706',
    bg: '#fef9c3',
    desc: 'Power outages, loose cables, spark hazards & transformers',
    dept: 'Electricity Department',
  },
  {
    name: 'Street Lights',
    icon: Lightbulb,
    color: '#ca8a04',
    bg: '#fef08a',
    desc: 'Broken lamps, non-functional streetlights & flickering bulbs',
    dept: 'Electricity Department',
  },
  {
    name: 'Drainage',
    icon: Waves,
    color: '#0891b2',
    bg: '#cffafe',
    desc: 'Blocked gutters, overflowing sewers & monsoon waterlogging',
    dept: 'Sanitation Department',
  },
  {
    name: 'Sanitation',
    icon: Sparkles,
    color: '#16a34a',
    bg: '#dcfce7',
    desc: 'Public toilet hygiene, pest control & street disinfection',
    dept: 'Sanitation Department',
  },
  {
    name: 'Public Transport',
    icon: Bus,
    color: '#4f46e5',
    bg: '#e0e7ff',
    desc: 'Bus delays, route issues, stop shelter damages & transit queries',
    dept: 'Public Transport Department',
  },
  {
    name: 'Other',
    icon: HelpCircle,
    color: '#7c3aed',
    bg: '#ede9fe',
    desc: 'Miscellaneous civic maintenance, permits & community concerns',
    dept: 'Water Department',
  },
];

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackQuery, setTrackQuery] = useState('');

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

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) {
      showToast('Please enter a tracking number or grievance ID', 'warning');
      return;
    }
    navigate(`/citizen/track?number=${encodeURIComponent(trackQuery.trim())}`);
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #4f46e5 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> Official Citizen Grievance Portal
            </div>
            <h1 style={{ color: '#ffffff', fontSize: '1.875rem', fontWeight: 800 }}>
              Welcome back, {user?.name || 'Citizen'}!
            </h1>
            <p style={{ color: '#bfdbfe', marginTop: '0.375rem', fontSize: '0.9375rem', maxWidth: '620px', lineHeight: 1.5 }}>
              Lodge complaints, monitor real-time municipal investigations, track resolution progress, and ensure accountability across all civic departments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/citizen/submit"
              className="btn btn-lg"
              style={{ backgroundColor: '#ffffff', color: '#1e40af', fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            >
              <PlusCircle size={20} />
              <span>Lodge New Grievance</span>
            </Link>
          </div>
        </div>

        {/* Quick Search & Track Bar */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', minWidth: '150px' }}>
              <SearchCheck size={18} />
              <span>Quick Track:</span>
            </div>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{
                  paddingLeft: '2.4rem',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  fontSize: '0.875rem',
                }}
                placeholder="Enter Grievance Tracking Number (e.g. GRV-2026...)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-sm" style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700 }}>
              Track Now
            </button>
          </form>
        </div>
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

      {/* Quick Civic Services Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Civic Services Directory</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Select a municipal department or service category to file an instant complaint
            </p>
          </div>
          <Link to="/citizen/services" className="btn btn-outline btn-sm">
            <span>View All Services</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-4">
          {CIVIC_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div key={srv.name} className="service-card">
                <div>
                  <div className="service-icon-box" style={{ backgroundColor: srv.bg, color: srv.color }}>
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {srv.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    {srv.desc}
                  </p>
                </div>
                <Link
                  to={`/citizen/submit?category=${encodeURIComponent(srv.name)}&dept=${encodeURIComponent(srv.dept)}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between', fontWeight: 700 }}
                >
                  <span>Report Issue</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Grievances Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Grievances</h2>
            <p className="card-subtitle">Latest civic issues submitted by your account</p>
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
              You haven't submitted any civic complaints yet. Choose a civic service above or click below to lodge your first complaint.
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
                      <Link
                        to={`/citizen/track?number=${g.grievance_number}`}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}
                        title="Click to track"
                      >
                        {g.grievance_number}
                      </Link>
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
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/citizen/track?number=${g.grievance_number}`} className="btn btn-outline btn-sm" title="Track timeline">
                          <span>Track</span>
                        </Link>
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
        )}
      </div>

      {/* Support & Helpline Banner */}
      <div
        className="card"
        style={{
          backgroundColor: '#f8fafc',
          border: '1.5px dashed var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#eff6ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PhoneCall size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
              24x7 Municipal Citizen Helpline: 1800-11-2026
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              For emergency power failures, hazardous water pipe bursts, or immediate civic assistance.
            </p>
          </div>
        </div>

        <Link to="/citizen/help" className="btn btn-outline btn-sm">
          <span>Help & FAQs</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default CitizenDashboard;
