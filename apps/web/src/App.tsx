import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PoiProvider } from './context/PoiContext';
import { MapView } from './pages/MapView';

export const App: React.FC = () => {
  return (
    <PoiProvider>
      <Routes>
        <Route path="/*" element={<MapView />} />
      </Routes>
    </PoiProvider>
  );
};
