import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

const CIVIC_SERVICES = [
  {
    id: 'water-supply',
    name: 'Water Supply',
    icon: Droplets,
    department: 'Water Department',
    sla: '24 - 48 Hours',
    description: 'Pipeline leakages, low water pressure, contaminated supply, or faulty water meters.',
    commonIssues: ['Pipeline leakage/burst', 'Contaminated water', 'No water supply', 'Faulty meter'],
  },
  {
    id: 'roads',
    name: 'Roads',
    icon: Milestone,
    department: 'Road Department',
    sla: '3 - 5 Days',
    description: 'Road surface maintenance, dangerous potholes, broken pavements, and illegal speed breakers.',
    commonIssues: ['Deep road potholes', 'Damaged pavement/sidewalk', 'Waterlogged road', 'Missing manhole cover'],
  },
  {
    id: 'garbage',
    name: 'Garbage',
    icon: Trash2,
    department: 'Sanitation Department',
    sla: '24 Hours',
    description: 'Doorstep waste collection, overflowing municipal bins, and illegal garbage dump yards.',
    commonIssues: ['Missed waste collection', 'Overflowing community bin', 'Open dumping on road', 'Dead animal removal'],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: Zap,
    department: 'Electricity Department',
    sla: '12 - 24 Hours',
    description: 'Localized power blackouts, hanging power lines, sparking transformers, and electric hazards.',
    commonIssues: ['Frequent power outage', 'Hanging loose wire', 'Transformer spark/smoke', 'Meter damaged'],
  },
  {
    id: 'street-lights',
    name: 'Street Lights',
    icon: Lightbulb,
    department: 'Electricity Department',
    sla: '48 Hours',
    description: 'Non-functional streetlights, broken light poles, flickering fixtures, or dark public walkways.',
    commonIssues: ['Streetlight not working', 'Light glowing during day', 'Broken pole', 'Dark street stretch'],
  },
  {
    id: 'drainage',
    name: 'Drainage',
    icon: Waves,
    department: 'Sanitation Department',
    sla: '24 - 48 Hours',
    description: 'Choked storm drains, overflowing sewage lines, backflow, and monsoon waterlogging.',
    commonIssues: ['Choked storm drain', 'Overflowing sewer', 'Broken drain slab', 'Stagnant water'],
  },
  {
    id: 'sanitation',
    name: 'Sanitation',
    icon: Sparkles,
    department: 'Sanitation Department',
    sla: '24 Hours',
    description: 'Sanitary conditions in public spots, unhygienic restrooms, mosquito fogging, and street cleaning.',
    commonIssues: ['Dirty public restroom', 'Mosquito fogging needed', 'Open dumping issue', 'Street sweeping neglected'],
  },
  {
    id: 'public-transport',
    name: 'Public Transport',
    icon: Bus,
    department: 'Public Transport Department',
    sla: '48 - 72 Hours',
    description: 'City bus services, route timings, broken shelter infrastructure, and commuter amenities.',
    commonIssues: ['Bus delay/irregular service', 'Damaged bus shelter', 'Overcharging/fare dispute', 'Driver misconduct'],
  },
  {
    id: 'other',
    name: 'Other',
    icon: HelpCircle,
    department: 'General Administration',
    sla: '3 - 7 Days',
    description: 'Tree branches trimming, illegal hoarding, noise complaints, and general civic matters.',
    commonIssues: ['Overhanging tree branch', 'Unauthorized hoarding/banner', 'Noise pollution', 'Encroachment'],
  },
];

export const CivicServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLodgeGrievance = (service) => {
    navigate(
      `/citizen/submit?category=${encodeURIComponent(service.name)}&dept=${encodeURIComponent(
        service.department
      )}`
    );
  };

  const filteredServices = CIVIC_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.commonIssues.some((issue) => issue.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            Civic Services & SLA Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
            Official service standards, target turnaround times, and direct grievance filing
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search civic services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      {/* Services Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {service.name}
                      </h3>
                      <span className="text-xs text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building2 size={11} /> {service.department}
                      </span>
                    </div>
                  </div>

                  <span className="badge badge-subtle" style={{ fontSize: '0.7rem' }}>
                    <Clock size={11} />
                    <span>{service.sla}</span>
                  </span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {service.description}
                </p>

                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--text-placeholder)',
                      marginBottom: '0.35rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Common Issues
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {service.commonIssues.map((issue) => (
                      <span
                        key={issue}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card-footer" style={{ padding: '0.65rem 1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Target SLA: <strong>{service.sla}</strong>
                </span>
                <button
                  onClick={() => handleLodgeGrievance(service)}
                  className="btn btn-primary btn-sm"
                >
                  <PlusCircle size={13} />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Citizen Charter Footer Notice */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Under the <strong>Citizen's Service Guarantee Act</strong>, if a grievance exceeds the prescribed SLA without departmental progress, it is automatically escalated to the Municipal Commissioner's office for expedited review.
        </div>
      </div>
    </div>
  );
};

export default CivicServicesPage;
