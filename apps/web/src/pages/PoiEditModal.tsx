import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, MapPin, X, Trash2, MousePointerClick, Loader2 } from 'lucide-react';
import { usePois } from '../context/PoiContext';
import { poiApi } from '../services/poiApi';
import { Poi } from '@poi/shared';

export const PoiEditModal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { pois, updatePoi, tempCoords, setTempCoords, setMapCenter, setPoiToDelete } = usePois();
  const navigate = useNavigate();

  const [poi, setPoi] = useState<Poi | null>(null);
  const [loadingPoi, setLoadingPoi] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch or find the POI being edited
  useEffect(() => {
    if (!id) return;
    const existing = pois.find((p) => p.id === id);
    if (existing) {
      setPoi(existing);
      setName(existing.name);
      setDescription(existing.description || '');
      setLatitude(existing.latitude.toString());
      setLongitude(existing.longitude.toString());
      setMapCenter({ lat: existing.latitude, lng: existing.longitude }, 14);
      setLoadingPoi(false);
    } else {
      // Direct load via URL: fetch from API
      poiApi
        .getById(id)
        .then((data) => {
          setPoi(data);
          setName(data.name);
          setDescription(data.description || '');
          setLatitude(data.latitude.toString());
          setLongitude(data.longitude.toString());
          setMapCenter({ lat: data.latitude, lng: data.longitude }, 14);
        })
        .catch(() => {
          navigate('/');
        })
        .finally(() => {
          setLoadingPoi(false);
        });
    }
  }, [id, pois, setMapCenter, navigate]);

  // If user clicks anywhere on the Leaflet map while editing, update coordinates
  useEffect(() => {
    if (tempCoords) {
      setLatitude(tempCoords.lat.toString());
      setLongitude(tempCoords.lng.toString());
    }
  }, [tempCoords]);

  // Clean up temporary marker on exit
  useEffect(() => {
    return () => {
      setTempCoords(null);
    };
  }, [setTempCoords]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'POI Name cannot be empty';
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
    if (!id || !validate()) return;

    setSubmitting(true);
    try {
      await updatePoi(id, {
        name: name.trim(),
        description: description.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      navigate('/');
    } catch {
      // Toast notification handles error
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

  const handleDeleteClick = () => {
    if (poi) {
      setPoiToDelete(poi);
      navigate('/');
    }
  };

  if (loadingPoi) {
    return (
      <div className="modal-overlay">
        <div className="modal-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading POI details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => navigate('/')}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Edit3 size={22} color="var(--primary)" />
            <span>Edit Point of Interest</span>
          </div>
          <button className="action-icon-btn" onClick={() => navigate('/')} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="map-picker-hint">
              <MousePointerClick size={16} />
              <span>
                <strong>Reposition:</strong> You can click anywhere on the Leaflet map to move this POI's position!
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-name">
                Name <span className="required">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-desc">
                Description
              </label>
              <textarea
                id="edit-desc"
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="coords-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-latitude">
                  Latitude (-90 to 90) <span className="required">*</span>
                </label>
                <input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  className={`form-input ${errors.latitude ? 'error' : ''}`}
                  value={latitude}
                  onChange={(e) => handleCoordsChange(e.target.value, longitude)}
                />
                {errors.latitude && <span className="form-error">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-longitude">
                  Longitude (-180 to 180) <span className="required">*</span>
                </label>
                <input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  className={`form-input ${errors.longitude ? 'error' : ''}`}
                  value={longitude}
                  onChange={(e) => handleCoordsChange(latitude, e.target.value)}
                />
                {errors.longitude && <span className="form-error">{errors.longitude}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteClick}
              disabled={submitting}
              id="btn-delete-from-edit"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                id="btn-save-poi"
              >
                <MapPin size={16} />
                <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
