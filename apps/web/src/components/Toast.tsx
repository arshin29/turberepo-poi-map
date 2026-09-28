import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { usePois } from '../context/PoiContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePois();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="var(--apple-success)" style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} color="var(--apple-danger)" style={{ flexShrink: 0 }} />
          )}
          <span style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</span>
          <button
            className="action-icon-btn"
            onClick={() => removeToast(toast.id)}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
