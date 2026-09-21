import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets,
  Milestone,
  Trash2,
  Zap,
  Lightbulb,
  Waves,
  Sparkles,
  Bus,
  HelpCircle,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle,
  Search,
  PlusCircle,
} from 'lucide-react';

const CIVIC_SERVICES = [
  {
    id: 'water-supply',
    name: 'Water Supply',
    icon: Droplets,
    color: '#0284c7',
    bg: '#e0f2fe',
    department: 'Water Department',
    sla: '24 - 48 Hours',
    description: 'Report municipal pipeline leakages, low water pressure, contaminated supply, or faulty water meter readings.',
    commonIssues: ['Pipeline leakage/burst', 'Contaminated/turbid water', 'No water supply in area', 'Faulty domestic meter'],
  },
  {
    id: 'roads',
    name: 'Roads',
    icon: Milestone,
    color: '#b45309',
    bg: '#fef3c7',
    department: 'Road Department',
    sla: '3 - 5 Days',
    description: 'Issues related to road maintenance, dangerous potholes, broken pathway pavements, and illegal speed breakers.',
    commonIssues: ['Deep road potholes', 'Damaged pavement/sidewalk', 'Waterlogged road surface', 'Missing manhole cover'],
  },
  {
    id: 'garbage',
    name: 'Garbage',
    icon: Trash2,
    color: '#059669',
    bg: '#d1fae5',
    department: 'Sanitation Department',
    sla: '24 Hours',
    description: 'Complaints regarding missed doorstep waste collection, overflowing municipal bins, and illegal garbage dump points.',
    commonIssues: ['Missed daily collection', 'Overflowing community bin', 'Open dumping on road', 'Dead animal removal'],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: Zap,
    color: '#d97706',
    bg: '#fef9c3',
    department: 'Electricity Department',
    sla: '12 - 24 Hours',
    description: 'Report localized power blackouts, hanging overhead power lines, sparking transformers, and safety hazards.',
    commonIssues: ['Frequent power outage', 'Hanging loose electrical wire', 'Transformer spark/smoke', 'Meter burnt/damaged'],
  },
  {
    id: 'street-lights',
    name: 'Street Lights',
    icon: Lightbulb,
    color: '#ca8a04',
    bg: '#fef08a',
    department: 'Electricity Department',
    sla: '48 Hours',
    description: 'Non-functional streetlights, broken light poles, flickering lamps, or areas in darkness requiring illumination.',
    commonIssues: ['Streetlight not glowing', 'Light glowing during daytime', 'Broken streetlight pole', 'Entire street in darkness'],
  },
  {
    id: 'drainage',
    name: 'Drainage',
    icon: Waves,
    color: '#0891b2',
    bg: '#cffafe',
    department: 'Sanitation Department',
    sla: '24 - 48 Hours',
    description: 'Choked public drains, overflowing sewage pipelines, backflow in residential areas, and monsoon waterlogging.',
    commonIssues: ['Choked storm drain', 'Overflowing sewage line', 'Broken drainage slab', 'Stagnant water near houses'],
  },
  {
    id: 'sanitation',
    name: 'Sanitation',
    icon: Sparkles,
    color: '#16a34a',
    bg: '#dcfce7',
    department: 'Sanitation Department',
    sla: '24 Hours',
    description: 'Sanitary conditions in public areas, unhygienic public restrooms, pest/mosquito fogging, and disinfection needs.',
    commonIssues: ['Dirty public restroom', 'Mosquito fogging required', 'Open defecation issue', 'Street sweeping neglected'],
  },
  {
    id: 'public-transport',
    name: 'Public Transport',
    icon: Bus,
    color: '#4f46e5',
    bg: '#e0e7ff',
    department: 'Public Transport Department',
    sla: '3 - 5 Days',
    description: 'Public bus route frequency, bus shelter damage, driver misbehavior, transit ticketing issues, and accessibility.',
    commonIssues: ['Bus skipping designated stop', 'Damaged bus stop shelter', 'Unscheduled trip cancellations', 'Overcrowding & frequency'],
  },
  {
    id: 'other',
    name: 'Other',
    icon: HelpCircle,
    color: '#7c3aed',
    bg: '#ede9fe',
    department: 'Water Department',
    sla: '3 - 7 Days',
    description: 'Any miscellaneous municipal problems, citizen inquiries, or matters spanning multiple administrative departments.',
    commonIssues: ['Encroachment on public space', 'Noise disturbance near hospital', 'Unauthorized tree cutting', 'General civic inquiry'],
  },
];

export const CivicServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredServices = CIVIC_SERVICES.filter(
    (srv) =>
      srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.commonIssues.some((issue) => issue.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleServiceSelect = (service) => {
    // Navigate to submit page with query params pre-populating category and department
    navigate(`/citizen/submit?category=${encodeURIComponent(service.name)}&dept=${encodeURIComponent(service.department)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <h1 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 800 }}>Civic Services Catalog</h1>
        <p style={{ color: '#bfdbfe', marginTop: '0.375rem', fontSize: '0.9375rem', maxWidth: '700px' }}>
          Explore municipal facilities provided by the City Corporation. Click on any civic service below to instantly lodge a complaint with the appropriate department.
        </p>

        {/* Search inside catalog */}
        <div style={{ marginTop: '1.25rem', maxWidth: '500px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', backgroundColor: '#ffffff', border: 'none' }}
            placeholder="Search services, keywords, or issue types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-6">
        {filteredServices.map((srv) => {
          const Icon = srv.icon;
          return (
            <div key={srv.id} className="service-card" style={{ padding: '1.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div className="service-icon-box" style={{ backgroundColor: srv.bg, color: srv.color }}>
                    <Icon size={28} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      color: 'var(--text-muted)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Clock size={12} /> SLA: {srv.sla}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {srv.name}
                </h2>

                <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <Building2 size={13} />
                  <span>{srv.department}</span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {srv.description}
                </p>

                {/* Common Issues Pills */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '0.375rem' }}>
                    Common Issues:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {srv.commonIssues.map((issue, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#f8fafc',
                          border: '1px solid var(--border-color)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                        }}
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleServiceSelect(srv)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'space-between', fontWeight: 700 }}
              >
                <div className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Lodge {srv.name} Grievance</span>
                </div>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CivicServicesPage;
