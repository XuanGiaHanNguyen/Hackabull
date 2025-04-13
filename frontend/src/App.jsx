import React from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation, BrowserRouter } from 'react-router-dom';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/LogIn';
import Signup from './pages/Auth/SignUp';
import ProtectedRoute from './pages/Auth/ProtectedRoute';
import Marketplace from './pages/Market';
import EcoShoppingAssistant from './extension/Extension';
import PostDetail from './component/PostDetail';
import SearchPage from './pages/component/SearchPage';
import ProductDetails from './pages/component/ProductDetails';


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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/extension" element={<EcoShoppingAssistant />} />

          {/* Protected routes in extension context */}
          <Route element={<ProtectedRoute />}>
            <Route path="/market" element={<Marketplace />} />
            <Route path='/posts/:id' element={<PostDetail />} />
            <Route path="/product" element={<SearchPage />} />
            <Route path="/product/:source/:id" element={<ProductDetails />} />

            {/* Adding this fallback route for /product with no parameters */}

          </Route>

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
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/market" element={<Marketplace />} />
            <Route path='/posts/:id' element={<PostDetail />} />
            <Route path="/product" element={<SearchPage />} />
            <Route path="/product/:source/:id" element={<ProductDetails />} />
            {/* Add other protected routes here */}
          </Route>

          {/* Route for extension preview with a special flag */}
          <Route path="/extension" element={<EcoShoppingAssistant webPreview={true} />} />

          {/* Fallback route for unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
