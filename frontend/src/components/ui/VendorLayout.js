import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isVendor } = useAuth();

  // Redirect if not a vendor
  if (!isVendor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Access Required</h2>
        <p className="text-gray-600 mb-6">You need to be registered as a vendor to access this page.</p>
        <Link to="/vendor/signup" className="text-green-600 hover:text-green-700 font-medium">
          Register as Vendor →
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vendor/products', icon: Package, label: 'My Products' },
    { path: '/vendor/orders', icon: ShoppingBag, label: 'Orders' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">BuildMart Vendor</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hi, {user.username}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-md p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default VendorLayout;