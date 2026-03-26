import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Package, Home, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <Package className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">BuildMart</span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="p-2 text-gray-700 hover:text-green-600 transition-colors"
                    data-testid="cart-button"
                  >
                    <ShoppingCart className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/orders"
                    className="hidden sm:flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
                    data-testid="orders-button"
                  >
                    <Package className="h-5 w-5" />
                    <span>Orders</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="hidden sm:inline text-sm text-gray-700">Hi, {user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                      data-testid="logout-button"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  data-testid="login-button"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                data-testid="mobile-search-input"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="grid grid-cols-4 h-16">
            <Link
              to="/"
              className="flex flex-col items-center justify-center text-gray-700 hover:text-green-600"
              data-testid="mobile-home-button"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/products?is_sustainable=true"
              className="flex flex-col items-center justify-center text-gray-700 hover:text-green-600"
              data-testid="mobile-eco-button"
            >
              <Leaf className="h-6 w-6" />
              <span className="text-xs mt-1">Eco</span>
            </Link>
            <Link
              to="/cart"
              className="flex flex-col items-center justify-center text-gray-700 hover:text-green-600"
              data-testid="mobile-cart-button"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1">Cart</span>
            </Link>
            <Link
              to="/orders"
              className="flex flex-col items-center justify-center text-gray-700 hover:text-green-600"
              data-testid="mobile-orders-button"
            >
              <Package className="h-6 w-6" />
              <span className="text-xs mt-1">Orders</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;