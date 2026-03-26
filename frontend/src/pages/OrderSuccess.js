import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Calendar, ArrowRight, Loader } from 'lucide-react';
import { ordersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadOrder();
  }, [orderId, isAuthenticated]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getById(orderId);
      setOrder(res.data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Order not found</p>
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium mt-4 inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="success-title">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="bg-green-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-700">Order ID</p>
            <p className="text-2xl font-bold text-green-600" data-testid="order-id">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              <Calendar className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium capitalize mt-1">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              <MapPin className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                <p className="text-gray-900">{order.delivery_address}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} x ₹{item.unit_price.toFixed(0)}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">
                    ₹{item.total_price.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
            <span className="text-xl font-semibold text-gray-900">Total Amount</span>
            <span className="text-3xl font-bold text-green-600" data-testid="order-total">
              ₹{order.total_amount.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            data-testid="view-orders-button"
          >
            <Package className="h-5 w-5" />
            <span>View My Orders</span>
          </Link>
          <Link
            to="/products"
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
            data-testid="continue-shopping-button"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;