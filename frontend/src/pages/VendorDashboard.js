import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { productsAPI, ordersAPI, vendorsAPI } from '../api/client';
import VendorLayout from '../components/ui/VendorLayout';

const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load vendor profile
      const vendorRes = await vendorsAPI.getMyProfile();
      setVendor(vendorRes.data);

      // Load products
      const productsRes = await productsAPI.getMyProducts();
      setProducts(productsRes.data);

      // Load orders
      const ordersRes = await ordersAPI.getVendorOrders();
      setOrders(ordersRes.data);

      // Calculate stats
      const pendingCount = ordersRes.data.filter(o => o.status === 'pending').length;
      const totalRevenue = ordersRes.data.reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        pendingOrders: pendingCount,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">{vendor?.business_name}</p>
          </div>
          <Link
            to="/vendor/products/new"
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            data-testid="add-product-button"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Verification Status */}
        {vendor?.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Verification Pending</p>
              <p className="text-sm text-yellow-800 mt-1">
                Your vendor account is under review. You'll be able to add products once verified.
              </p>
            </div>
          </div>
        )}

        {vendor?.status === 'verified' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-semibold text-green-900">Verified Vendor ✓</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toFixed(0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
            <Link to="/vendor/products" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No products yet</p>
              {vendor?.status === 'verified' && (
                <Link
                  to="/vendor/products/new"
                  className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Add your first product →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">₹{product.price} / {product.unit}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">{order.items.length} items • ₹{order.total_amount}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorDashboard;