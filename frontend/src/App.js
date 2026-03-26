import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/ui/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Main App Layout
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Placeholder routes for future phases */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Cart</h1>
                <p className="text-gray-600">Coming in Phase 5</p>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
                <p className="text-gray-600">Coming in Phase 6</p>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;