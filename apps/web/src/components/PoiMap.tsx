import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { usePois } from '../context/PoiContext';
import { Edit3, Trash2, MapPin, Compass } from 'lucide-react';
import { Poi } from '@poi/shared';

/**
 * Creates custom HTML Leaflet DivIcon with beautiful modern SVG markers.
 */
function createCustomPin(isActive = false, isTemp = false): L.DivIcon {
  const pinClass = isTemp ? 'marker-pin temp' : isActive ? 'marker-pin active' : 'marker-pin';
  return L.divIcon({
    className: 'custom-poi-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
    html: `
      <div class="${pinClass}">
        <div class="marker-inner-dot"></div>
      </div>
    `,
  });
}

/**
 * Component inside MapContainer to dynamically animate map center/zoom
 * when selectedPoi or mapCenter in context updates.
 */
function MapController() {
  const map = useMap();
  const { mapCenter, mapZoom, selectedPoi } = usePois();

  useEffect(() => {
    map.flyTo([mapCenter.lat, mapCenter.lng], mapZoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [map, mapCenter, mapZoom]);

  return null;
}

/**
 * Handles clicks anywhere on the Leaflet map:
 * - Emits clicked coordinates to context
 * - If onAddMode is enabled or user wants to pick a location, places temp pin
 */
interface MapClickHandlerProps {
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    },
  });
  return null;
}

interface PoiMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  interactiveSelection?: boolean;
}

export const PoiMap: React.FC<PoiMapProps> = ({ onMapClick, interactiveSelection }) => {
  const { pois, selectedPoi, selectPoi, tempCoords, setPoiToDelete, mapCenter, mapZoom } = usePois();
  const navigate = useNavigate();
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // When a POI is selected, open its popup automatically
  useEffect(() => {
    if (selectedPoi && markerRefs.current[selectedPoi.id]) {
      markerRefs.current[selectedPoi.id]?.openPopup();
    }
  }, [selectedPoi]);

  return (
    <div className="map-viewport">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController />

        <MapClickHandler
          onMapClick={(lat, lng) => {
            if (onMapClick) {
              onMapClick(lat, lng);
            }
          }}
        />

        {/* Existing Points of Interest Markers */}
        {pois.map((poi) => {
          const isSelected = selectedPoi?.id === poi.id;
          return (
            <Marker
              key={poi.id}
              position={[poi.latitude, poi.longitude]}
              icon={createCustomPin(isSelected, false)}
              ref={(ref) => {
                markerRefs.current[poi.id] = ref;
              }}
              eventHandlers={{
                click: () => {
                  selectPoi(poi);
                },
              }}
            >
              <Popup>
                <div className="popup-title">{poi.name}</div>
                {poi.description && (
                  <div className="popup-description">{poi.description}</div>
                )}
                <div className="popup-coords-badge">
                  <MapPin size={12} />
                  <span>
                    {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="popup-actions-row">
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      selectPoi(poi);
                      navigate(`/pois/${poi.id}`);
                    }}
                    id={`popup-btn-edit-${poi.id}`}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setPoiToDelete(poi);
                    }}
                    id={`popup-btn-delete-${poi.id}`}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Temporary coordinate marker when clicking to place a new POI */}
        {tempCoords && (
          <Marker
            position={[tempCoords.lat, tempCoords.lng]}
            icon={createCustomPin(false, true)}
          >
            <Popup autoPan={false}>
              <div style={{ textAlign: 'center', padding: '0.25rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  Selected Location
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {tempCoords.lat.toFixed(4)}, {tempCoords.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
