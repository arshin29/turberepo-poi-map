import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { usePois } from '../context/PoiContext';

export const DeleteConfirmModal: React.FC = () => {
  const { poiToDelete, setPoiToDelete, deletePoi } = usePois();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!poiToDelete) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await deletePoi(poiToDelete.id);
    } catch {
      // Toast error is handled in context
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setPoiToDelete(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div className="modal-header-title" style={{ color: 'var(--apple-danger)' }}>
            <AlertTriangle size={22} />
            <span>Delete Point of Interest</span>
          </div>
          <button className="action-icon-btn" onClick={handleCancel} disabled={isDeleting}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Are you sure you want to permanently delete <strong>"{poiToDelete.name}"</strong>?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            This action will remove the record from SQLite and immediately remove the marker from the Leaflet map. This cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={isDeleting}
            id="btn-confirm-delete"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete POI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
