import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', fullPage = false, size = 26 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        minHeight: fullPage ? '50vh' : 'auto',
        width: '100%',
      }}
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={size}
        style={{
          color: 'var(--primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && (
        <span
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
