import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { PoiSidebar } from '../components/PoiSidebar';
import { PoiMap } from '../components/PoiMap';
import { PoiNewModal } from './PoiNewModal';
import { PoiEditModal } from './PoiEditModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ToastContainer } from '../components/Toast';
import { usePois } from '../context/PoiContext';

export const MapView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { setTempCoords } = usePois();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we are currently in add mode or edit mode
  const isAddMode = location.pathname === '/pois/new';
  const isEditMode = location.pathname.startsWith('/pois/') && location.pathname !== '/pois/new';

  const handleMapClick = (lat: number, lng: number) => {
    // When clicking on the map:
    // 1. If modal is already open, update tempCoords
    // 2. If user is browsing the map and clicks anywhere, set tempCoords and open /pois/new!
    setTempCoords({ lat, lng });
    if (!isAddMode && !isEditMode) {
      navigate('/pois/new');
    }
  };

  return (
    <div className="app-layout">
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <main className="dashboard-content">
        <PoiSidebar isOpen={sidebarOpen} />
        <PoiMap onMapClick={handleMapClick} />
      </main>

      {/* Modal Routes: preserves the interactive map background */}
      <Routes>
        <Route path="/pois/new" element={<PoiNewModal />} />
        <Route path="/pois/:id" element={<PoiEditModal />} />
      </Routes>

      <DeleteConfirmModal />
      <ToastContainer />
    </div>
  );
};
