import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import {
  HelpCircle,
  PlusCircle,
  SearchCheck,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Shield,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const STATUS_EXPLANATIONS = [
  {
    status: 'SUBMITTED',
    title: 'Grievance Submitted',
    desc: 'The complaint has been successfully registered on the portal and assigned a unique tracking number (e.g. GRV-YYYYMMDD-XXXXX). It is awaiting initial automated validation and municipal triage.',
    sla: 'Within 2 hours',
  },
  {
    status: 'UNDER_REVIEW',
    title: 'Under Review',
    desc: 'The municipal administrative desk has reviewed the complaint, verified jurisdiction, and confirmed the designated department for resolution.',
    sla: 'Within 12 hours',
  },
  {
    status: 'ASSIGNED',
    title: 'Officer Assigned',
    desc: 'A designated field inspector or zonal junior engineer has been allocated to inspect the reported ground issue and formulate remedial measures.',
    sla: 'Within 24 hours',
  },
  {
    status: 'IN_PROGRESS',
    title: 'Work In Progress',
    desc: 'Remedial work, civil maintenance, pipeline repair, or on-site sanitary actions are actively being executed by the field team.',
    sla: '1 - 3 Days depending on priority',
  },
  {
    status: 'RESOLVED',
    title: 'Issue Resolved',
    desc: 'The assigned officer has completed the required maintenance and filed a resolution report. The citizen is invited to provide satisfaction feedback.',
    sla: 'Finalized',
  },
  {
    status: 'REJECTED',
    title: 'Rejected / Out of Scope',
    desc: 'The complaint was determined to be a duplicate, located on private/unauthorized property, or outside municipal corporation jurisdiction. Detailed reasons are recorded in the audit trail.',
    sla: 'Finalized with justification',
  },
  {
    status: 'CLOSED',
    title: 'Closed',
    desc: 'The grievance lifecycle is officially closed after citizen confirmation or the expiration of the feedback appeal period.',
    sla: 'Archived',
  },
];

const FAQS = [
  {
    category: 'Submission & Tracking',
    questions: [
      {
        q: 'How do I lodge a civic grievance on the portal?',
        a: 'Click on "Submit Grievance" from the sidebar navigation or select a service from "Civic Services". Fill out the required details including department, category, priority, specific location, and detailed description. Once submitted, a tracking number (e.g. GRV-20260921-A1B2C) will be generated instantly.',
      },
      {
        q: 'Where do I find my grievance tracking number?',
        a: 'Your tracking number is displayed immediately upon grievance submission, sent via your notification feed, and listed in your "My Grievances" dashboard under the tracking column.',
      },
      {
        q: 'Can I edit a grievance after submitting it?',
        a: 'Yes, you can edit grievance parameters while it is still in the "SUBMITTED" status. Once an officer is assigned or review begins, modifications are locked to maintain audit integrity, though you can post updates in the discussion comments.',
      },
      {
        q: 'How do I track the real-time progress of my complaint?',
        a: 'Navigate to "Track Grievance" from the sidebar and input your tracking number or system ID. You will see a visual 5-stage progress stepper and a complete chronological audit trail of all officer actions.',
      },
    ],
  },
  {
    category: 'Resolutions & Feedback',
    questions: [
      {
        q: 'How long does it take for a complaint to be resolved?',
        a: 'Standard resolution timelines vary by category and priority: Critical safety hazards (12-24 hours), Water & Electricity issues (24-48 hours), Roads and Infrastructure (3-5 days).',
      },
      {
        q: 'How do I submit feedback on a resolved grievance?',
        a: 'Once your grievance status transitions to "RESOLVED", you can navigate to the "Feedback" page or click the "Feedback" button on the grievance details card to rate satisfaction on a 5-star scale and provide remarks.',
      },
      {
        q: 'What should I do if my grievance was closed without resolution?',
        a: 'You can post a message in the discussion comments thread on the grievance details page or file a new urgent grievance referencing the previous tracking number for municipal escalation.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    questions: [
      {
        q: 'Is my personal contact information visible publicly?',
        a: 'No. Your phone number and email address are strictly confidential and only accessible to designated municipal officers and administrators assigned to resolve your issue.',
      },
      {
        q: 'How do I change my phone number or update my profile?',
        a: 'Navigate to "My Profile" from the sidebar or top navbar to update your full name, contact phone number, and change account passwords.',
      },
    ],
  },
];

export const HelpFaqPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState('0-0'); // CategoryIndex-QuestionIndex

  const toggleFaq = (idxKey) => {
    setOpenFaqIndex((prev) => (prev === idxKey ? null : idxKey));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1050px', margin: '0 auto' }}>
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
        <div className="flex items-center gap-2" style={{ color: '#bfdbfe', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          <HelpCircle size={16} /> Knowledge Base & Support
        </div>
        <h1 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 800 }}>Citizen Help Center & FAQs</h1>
        <p style={{ color: '#bfdbfe', marginTop: '0.375rem', fontSize: '0.9375rem', maxWidth: '680px' }}>
          Learn how to lodge complaints, track investigation milestones, understand status classifications, and reach municipal support teams.
        </p>
      </div>

      {/* 3 Step Pictorial Guide */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          How CivicCare Works (3-Step Redressal Flow)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Transparent municipal accountability from submission to on-ground verification
        </p>

        <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
              1
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Lodge Your Grievance
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Select your department and category, describe the issue, specify landmark location, and submit to receive an instant tracking ID.
            </p>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
              2
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Officer Assigned & Inspection
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              The department assigns a specialized field officer to inspect the site and carry out on-ground maintenance.
            </p>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--success)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
              3
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
              Resolution & Citizen Feedback
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Once resolved, you receive an alert and can submit satisfaction ratings to ensure quality standards.
            </p>
          </div>
        </div>
      </div>

      {/* Explanation of Grievance Statuses */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Grievance Statuses Glossary</h2>
            <p className="card-subtitle">Understand what each status label means during grievance processing</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STATUS_EXPLANATIONS.map((item) => (
            <div
              key={item.status}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: '130px' }}>
                <StatusBadge status={item.status} />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {item.title}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Target SLA: <strong>{item.sla}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Frequently Asked Questions</h2>
            <p className="card-subtitle">Quick answers to common citizen inquiries</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {FAQS.map((cat, catIdx) => (
            <div key={cat.category}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                {cat.category}
              </h3>

              {cat.questions.map((qItem, qIdx) => {
                const key = `${catIdx}-${qIdx}`;
                const isOpen = openFaqIndex === key;

                return (
                  <div key={key} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                    <div className="faq-header" onClick={() => toggleFaq(key)}>
                      <span>{qItem.q}</span>
                      {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} />}
                    </div>
                    {isOpen && <div className="faq-body">{qItem.a}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Municipal Contact Directory Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Municipal Corporation Support Directory
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Official channels to get in touch with civic representatives and administrative supervisors
        </p>

        <div className="grid grid-cols-3 lg-grid-cols-2 md-grid-cols-1 gap-4">
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
              <PhoneCall size={18} />
              <span>Toll-Free Helpline</span>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
              1800-11-2026
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Available 24x7 for emergencies & general civic complaints
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Mail size={18} />
              <span>Official Email Support</span>
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
              grievance-support@civiccare.gov.in
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Response time within 1 business day
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2" style={{ color: '#059669', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Clock size={18} />
              <span>Operating Hours</span>
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Mon - Sat: 9:00 AM - 6:00 PM
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Municipal Administrative Offices
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFaqPage;
