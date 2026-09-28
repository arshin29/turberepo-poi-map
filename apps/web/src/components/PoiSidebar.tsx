import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Edit3, Trash2, Navigation, Compass, AlertCircle } from 'lucide-react';
import { usePois } from '../context/PoiContext';
import { Poi } from '@poi/shared';

interface PoiSidebarProps {
  isOpen?: boolean;
}

export const PoiSidebar: React.FC<PoiSidebarProps> = ({ isOpen = true }) => {
  const { pois, loading, selectedPoi, selectPoi, setPoiToDelete } = usePois();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filter POIs based on search query
  const filteredPois = useMemo(() => {
    if (!searchTerm.trim()) return pois;
    const query = searchTerm.toLowerCase();
    return pois.filter(
      (poi) =>
        poi.name.toLowerCase().includes(query) ||
        (poi.description && poi.description.toLowerCase().includes(query))
    );
  }, [pois, searchTerm]);

  const handleCardClick = (poi: Poi) => {
    selectPoi(poi);
  };

  const handleEdit = (e: React.MouseEvent, poi: Poi) => {
    e.stopPropagation();
    selectPoi(poi);
    navigate(`/pois/${poi.id}`);
  };

  const handleDelete = (e: React.MouseEvent, poi: Poi) => {
    e.stopPropagation();
    setPoiToDelete(poi);
  };

  return (
    <aside className={`poi-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <h2 className="sidebar-title">Locations</h2>
          <span className="poi-count-badge">
            {filteredPois.length} {filteredPois.length === 1 ? 'place' : 'places'}
          </span>
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="poi-list-container">
        {loading && pois.length === 0 ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Loading points of interest...</p>
          </div>
        ) : filteredPois.length === 0 ? (
          <div className="state-container">
            <Compass className="state-icon" />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {searchTerm ? 'No matching places' : 'No POIs saved yet'}
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {searchTerm
                ? 'Try a different keyword or clear your search filter.'
                : 'Click "Add POI" or click on the map to create your first location!'}
            </p>
          </div>
        ) : (
          filteredPois.map((poi) => {
            const isSelected = selectedPoi?.id === poi.id;
            return (
              <div
                key={poi.id}
                className={`poi-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleCardClick(poi)}
              >
                <div className="poi-card-header">
                  <h3 className="poi-card-name">{poi.name}</h3>
                  <button
                    className="action-icon-btn"
                    title="Center on map"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPoi(poi);
                    }}
                  >
                    <Navigation size={14} />
                  </button>
                </div>

                {poi.description && (
                  <p className="poi-card-desc">{poi.description}</p>
                )}

                <div className="poi-card-footer">
                  <span className="poi-card-coords">
                    <MapPin size={12} />
                    {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                  </span>

                  <div className="poi-card-actions">
                    <button
                      className="action-icon-btn"
                      title="Edit this POI"
                      onClick={(e) => handleEdit(e, poi)}
                      id={`btn-edit-${poi.id}`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="action-icon-btn danger"
                      title="Delete this POI"
                      onClick={(e) => handleDelete(e, poi)}
                      id={`btn-delete-${poi.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
