import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, RefreshCw, Layers } from 'lucide-react';
import { usePois } from '../context/PoiContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { pois, loading, apiConnected, refreshPois } = usePois();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleSidebar && (
          <button
            className="action-icon-btn"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
            style={{ display: 'none' }} /* shown via media queries if needed */
          >
            <Layers size={20} />
          </button>
        )}
        <Link to="/" className="header-brand">
          <div className="brand-icon">
            <MapPin size={17} />
          </div>
          <div>
            <div className="brand-title">Points of Interest</div>
          </div>
        </Link>
      </div>

      <div className="header-actions">
        <div className={`status-badge ${apiConnected ? '' : 'error'}`} title={apiConnected ? 'Connected to NestJS API' : 'API Unreachable'}>
          <span className="status-dot"></span>
          <span>{apiConnected ? 'API Online' : 'API Offline'}</span>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => refreshPois()}
          disabled={loading}
          title="Refresh POI data"
        >
          <RefreshCw size={15} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/pois/new')}
          id="btn-add-poi"
        >
          <Plus size={18} />
          <span>Add POI</span>
        </button>
      </div>
    </header>
  );
};
