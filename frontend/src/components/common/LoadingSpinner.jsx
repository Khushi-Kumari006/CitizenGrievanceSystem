import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', fullPage = false, size = 32 }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6" style={{ minHeight: fullPage ? '60vh' : 'auto' }}>
      <Loader2 size={size} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return content;
};

export default LoadingSpinner;
