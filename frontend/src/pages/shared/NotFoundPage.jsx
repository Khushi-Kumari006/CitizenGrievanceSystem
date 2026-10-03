import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 16px var(--primary-glow)',
        }}
      >
        <ShieldAlert size={36} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '460px', marginTop: '0.5rem', marginBottom: '1.75rem', lineHeight: 1.55 }}>
        The page or municipal resource you are looking for does not exist or has been relocated within the portal.
      </p>
      <Link to="/" className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
        <ArrowLeft size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
