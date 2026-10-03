import React, { useState } from 'react';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Mail,
  Clock,
  FileText,
  UserCheck,
  CheckCircle2,
  Building2,
  BookOpen,
} from 'lucide-react';

const STATUS_EXPLANATIONS = [
  {
    status: 'SUBMITTED',
    title: 'Grievance Submitted',
    desc: 'The complaint has been registered on the portal with a unique tracking code. It is in the municipal triage queue.',
    sla: 'Within 2 hours',
  },
  {
    status: 'UNDER_REVIEW',
    title: 'Under Review',
    desc: 'The administrative desk has confirmed jurisdiction and verified the designated department.',
    sla: 'Within 12 hours',
  },
  {
    status: 'ASSIGNED',
    title: 'Officer Assigned',
    desc: 'A designated field inspector or junior engineer has been allocated to inspect the site and formulate remedial action.',
    sla: 'Within 24 hours',
  },
  {
    status: 'IN_PROGRESS',
    title: 'Work In Progress',
    desc: 'Civil repairs, sanitary maintenance, or pipeline restoration work is actively being executed on site.',
    sla: '1 - 3 Days',
  },
  {
    status: 'RESOLVED',
    title: 'Issue Resolved',
    desc: 'The assigned officer has completed maintenance and filed a report. Citizen satisfaction feedback is enabled.',
    sla: 'Completed',
  },
  {
    status: 'CLOSED',
    title: 'Closed',
    desc: 'The case lifecycle is finalized following citizen confirmation or standard appeal window closure.',
    sla: 'Archived',
  },
];

const FAQS = [
  {
    category: 'Lodging & Tracking',
    questions: [
      {
        q: 'How do I lodge a civic grievance on the portal?',
        a: 'Click on "Submit Grievance" from the sidebar navigation. Fill out the required details including department, category, priority, street location, and description. You can also pinpoint the location on the map. Once submitted, a tracking code will be generated instantly.',
      },
      {
        q: 'Where do I find my grievance tracking number?',
        a: 'Your tracking number is displayed immediately upon submission, stored in your notifications feed, and listed in your "My Grievances" table.',
      },
      {
        q: 'Can I track a grievance without logging in?',
        a: 'Tracking codes are securely tied to the citizen portal. Log in with your registered citizen account to track full investigation notes and post follow-up comments.',
      },
    ],
  },
  {
    category: 'Service Standards & SLAs',
    questions: [
      {
        q: 'How long does it take for a complaint to be resolved?',
        a: 'Target resolution timelines depend on category and priority: Critical safety hazards (12-24 hours), Water & Electricity issues (24-48 hours), Roads & Civil works (3-5 days).',
      },
      {
        q: 'How do I submit feedback after resolution?',
        a: 'Once your complaint status transitions to "RESOLVED", visit the "Feedback" page from the navigation bar to submit a 5-star rating and satisfaction review.',
      },
      {
        q: 'What happens if a complaint exceeds its SLA?',
        a: 'Overdue complaints are automatically flagged in red on administrative dashboards and escalated to the senior zonal commissioner.',
      },
    ],
  },
];

export const HelpFaqPage = () => {
  const [openItems, setOpenItems] = useState({ '0-0': true, '1-0': true });

  const toggleItem = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          Help Center & FAQs
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
          Understanding grievance lifecycles, service charters, and municipal contact helplines
        </p>
      </div>

      {/* 3-Step Redressal Workflow Guide */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--primary)" />
            <span className="card-title">How Grievance Redressal Works</span>
          </div>
        </div>

        <div className="card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-text)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.65rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Lodge Grievance
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                Submit issue parameters, photos, and precise GPS location via the citizen form.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-text)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.65rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Field Action
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                Designated municipal officer inspects the site and executes necessary repairs.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-text)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.65rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Resolution & Feedback
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                Review the completed work, rate officer satisfaction, and close the case.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Glossary Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--primary)" />
            <span className="card-title">Status Glossary & Target SLAs</span>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Status Stage</th>
                <th>Definition & Action</th>
                <th>Standard SLA</th>
              </tr>
            </thead>
            <tbody>
              {STATUS_EXPLANATIONS.map((st) => (
                <tr key={st.status}>
                  <td>
                    <StatusBadge status={st.status} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.84rem' }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {st.desc}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge badge-subtle" style={{ fontSize: '0.7rem' }}>
                      <Clock size={11} />
                      <span>{st.sla}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={16} color="var(--primary)" />
            <span className="card-title">Frequently Asked Questions</span>
          </div>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQS.map((category, catIdx) => (
            <div key={category.category}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-placeholder)',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.04em',
                }}
              >
                {category.category}
              </div>

              <div className="faq-group">
                {category.questions.map((faq, qIdx) => {
                  const itemKey = `${catIdx}-${qIdx}`;
                  const isOpen = Boolean(openItems[itemKey]);

                  return (
                    <div key={faq.q} className={`faq-card ${isOpen ? 'open' : ''}`}>
                      <div className="faq-header" onClick={() => toggleItem(itemKey)}>
                        <span className="faq-question">{faq.q}</span>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      {isOpen && <div className="faq-content">{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Municipal Contact Information */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <PhoneCall size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-heading)' }}>
              Central Citizen Helpline
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              1800-345-0011 (24x7 Toll Free)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <Mail size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-heading)' }}>
              Official Email Support
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              support@civiccare.gov.in
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <Building2 size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-heading)' }}>
              Municipal Corporation Headquarters
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Civic Center, Connaught Place, New Delhi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFaqPage;
