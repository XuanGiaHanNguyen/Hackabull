import React from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation, BrowserRouter } from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import EcoShoppingAssistant from './extension/Extension';

// This component tracks and logs route changes - helpful for debugging
function RouteTracker() {
  const location = useLocation();
  React.useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);
  
  return null;
}

function App() {
  // Check if we're in a Chrome extension context
  const isExtensionContext = window.chrome && chrome.runtime && chrome.runtime.id;
  
  // Use different router based on environment
  if (isExtensionContext) {
    // Extension environment - use MemoryRouter
    return (
      <MemoryRouter initialEntries={['/extension']}>
        <RouteTracker />
        <Routes>
          {/* Extension routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/extension" element={<EcoShoppingAssistant />} />
          
          {/* Catch any undefined routes and redirect to extension */}
          <Route path="*" element={<Navigate to="/extension" replace />} />
        </Routes>
      </MemoryRouter>
    );
  } else {
    // Web environment - use BrowserRouter
    return (
      <BrowserRouter>
        <RouteTracker />
        <Routes>
          {/* Web routes - don't default to extension */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          {/* Route for extension preview with a special flag */}
          <Route path="/extension" element={<EcoShoppingAssistant webPreview={true} />} />
          
          {/* Catch any undefined routes and redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
