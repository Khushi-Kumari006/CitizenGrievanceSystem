import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <ShieldAlert size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '450px', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
