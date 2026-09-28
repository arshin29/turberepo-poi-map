import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, X, MousePointerClick, AlertCircle } from 'lucide-react';
import { usePois } from '../context/PoiContext';

export const PoiNewModal: React.FC = () => {
  const { createPoi, tempCoords, setTempCoords, setMapCenter } = usePois();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // If user clicked on the map while this modal is open or right before,
  // update the form inputs with the selected coordinates
  useEffect(() => {
    if (tempCoords) {
      setLatitude(tempCoords.lat.toString());
      setLongitude(tempCoords.lng.toString());
    }
  }, [tempCoords]);

  // Clean up temporary marker on unmount
  useEffect(() => {
    return () => {
      setTempCoords(null);
    };
  }, [setTempCoords]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'POI Name is required';
    }

    const latNum = parseFloat(latitude);
    if (!latitude.trim() || isNaN(latNum)) {
      newErrors.latitude = 'A valid latitude number is required';
    } else if (latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90 degrees';
    }

    const lngNum = parseFloat(longitude);
    if (!longitude.trim() || isNaN(lngNum)) {
      newErrors.longitude = 'A valid longitude number is required';
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180 degrees';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createPoi({
        name: name.trim(),
        description: description.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      navigate('/');
    } catch {
      // Toast notification handles the error
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoordsChange = (newLat: string, newLng: string) => {
    setLatitude(newLat);
    setLongitude(newLng);
    const latNum = parseFloat(newLat);
    const lngNum = parseFloat(newLng);
    if (!isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
      setTempCoords({ lat: latNum, lng: lngNum });
      setMapCenter({ lat: latNum, lng: lngNum });
    }
  };

  return (
    <div className="modal-overlay" onClick={() => navigate('/')}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <PlusCircle size={22} color="var(--primary)" />
            <span>Add Point of Interest</span>
          </div>
          <button
            className="action-icon-btn"
            onClick={() => navigate('/')}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="map-picker-hint">
              <MousePointerClick size={16} />
              <span>
                <strong>Map Coordinate Picker:</strong> You can click anywhere on the background map to automatically populate the coordinates!
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="poi-name">
                Name <span className="required">*</span>
              </label>
              <input
                id="poi-name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Louvre Museum"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="poi-desc">
                Description
              </label>
              <textarea
                id="poi-desc"
                className="form-textarea"
                rows={3}
                placeholder="Brief description, history, or notes about this location..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="coords-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="poi-latitude">
                  Latitude (-90 to 90) <span className="required">*</span>
                </label>
                <input
                  id="poi-latitude"
                  type="number"
                  step="any"
                  className={`form-input ${errors.latitude ? 'error' : ''}`}
                  placeholder="e.g. 48.8606"
                  value={latitude}
                  onChange={(e) => handleCoordsChange(e.target.value, longitude)}
                />
                {errors.latitude && <span className="form-error">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="poi-longitude">
                  Longitude (-180 to 180) <span className="required">*</span>
                </label>
                <input
                  id="poi-longitude"
                  type="number"
                  step="any"
                  className={`form-input ${errors.longitude ? 'error' : ''}`}
                  placeholder="e.g. 2.3376"
                  value={longitude}
                  onChange={(e) => handleCoordsChange(latitude, e.target.value)}
                />
                {errors.longitude && <span className="form-error">{errors.longitude}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-submit-poi"
            >
              <MapPin size={16} />
              <span>{submitting ? 'Creating POI...' : 'Create POI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
