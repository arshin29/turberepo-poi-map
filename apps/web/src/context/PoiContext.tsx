import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Poi, CreatePoiDto, UpdatePoiDto } from '@poi/shared';
import { poiApi, ApiError } from '../services/poiApi';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface PoiContextType {
  pois: Poi[];
  loading: boolean;
  error: string | null;
  selectedPoi: Poi | null;
  mapCenter: LatLng;
  mapZoom: number;
  tempCoords: LatLng | null;
  poiToDelete: Poi | null;
  toasts: ToastMessage[];
  apiConnected: boolean;
  refreshPois: () => Promise<void>;
  selectPoi: (poi: Poi | null) => void;
  setMapCenter: (coords: LatLng, zoom?: number) => void;
  setTempCoords: (coords: LatLng | null) => void;
  setPoiToDelete: (poi: Poi | null) => void;
  createPoi: (dto: CreatePoiDto) => Promise<Poi>;
  updatePoi: (id: string, dto: UpdatePoiDto) => Promise<Poi>;
  deletePoi: (id: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

const PoiContext = createContext<PoiContextType | undefined>(undefined);

export const PoiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [mapCenter, setMapCenterState] = useState<LatLng>({ lat: 48.8584, lng: 2.2945 }); // Default: Paris
  const [mapZoom, setMapZoom] = useState<number>(3);
  const [tempCoords, setTempCoords] = useState<LatLng | null>(null);
  const [poiToDelete, setPoiToDelete] = useState<Poi | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setMapCenter = useCallback((coords: LatLng, zoom?: number) => {
    setMapCenterState(coords);
    if (zoom !== undefined) {
      setMapZoom(zoom);
    }
  }, []);

  const refreshPois = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await poiApi.getAll();
      setPois(data);
      setApiConnected(true);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch POIs from API';
      setError(msg);
      setApiConnected(false);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshPois();
  }, [refreshPois]);

  const selectPoi = useCallback((poi: Poi | null) => {
    setSelectedPoi(poi);
    if (poi) {
      setMapCenterState({ lat: poi.latitude, lng: poi.longitude });
      setMapZoom(13);
    }
  }, []);

  const createPoi = useCallback(
    async (dto: CreatePoiDto): Promise<Poi> => {
      const created = await poiApi.create(dto);
      // Update POI state immediately without full page reload
      setPois((prev) => [created, ...prev]);
      setSelectedPoi(created);
      setMapCenterState({ lat: created.latitude, lng: created.longitude });
      setMapZoom(13);
      setTempCoords(null);
      showToast(`POI "${created.name}" created successfully!`, 'success');
      return created;
    },
    [showToast]
  );

  const updatePoi = useCallback(
    async (id: string, dto: UpdatePoiDto): Promise<Poi> => {
      const updated = await poiApi.update(id, dto);
      // Update existing item in list
      setPois((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelectedPoi(updated);
      setMapCenterState({ lat: updated.latitude, lng: updated.longitude });
      setTempCoords(null);
      showToast(`POI "${updated.name}" updated successfully!`, 'success');
      return updated;
    },
    [showToast]
  );

  const deletePoi = useCallback(
    async (id: string) => {
      const target = pois.find((p) => p.id === id);
      const name = target?.name || 'POI';
      await poiApi.delete(id);
      // Remove marker & record from local state immediately
      setPois((prev) => prev.filter((p) => p.id !== id));
      if (selectedPoi?.id === id) {
        setSelectedPoi(null);
      }
      setPoiToDelete(null);
      showToast(`"${name}" has been deleted.`, 'success');
    },
    [pois, selectedPoi, showToast]
  );

  return (
    <PoiContext.Provider
      value={{
        pois,
        loading,
        error,
        selectedPoi,
        mapCenter,
        mapZoom,
        tempCoords,
        poiToDelete,
        toasts,
        apiConnected,
        refreshPois,
        selectPoi,
        setMapCenter,
        setTempCoords,
        setPoiToDelete,
        createPoi,
        updatePoi,
        deletePoi,
        showToast,
        removeToast,
      }}
    >
      {children}
    </PoiContext.Provider>
  );
};

export const usePois = (): PoiContextType => {
  const context = useContext(PoiContext);
  if (!context) {
    throw new Error('usePois must be used within a PoiProvider');
  }
  return context;
};
