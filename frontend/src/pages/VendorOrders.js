import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, Clock } from 'lucide-react';
import { ordersAPI } from '../api/client';
import VendorLayout from '../components/ui/VendorLayout';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getVendorOrders();
      setOrders(res.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      // Reload orders to get updated data
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const statusOptions = ['confirmed', 'packed', 'out_for_delivery', 'delivered'];
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'packed': return 'bg-purple-100 text-purple-700';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">{orders.length} total orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
              data-testid={`filter-${status}`}
            >
              {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
              {status !== 'all' && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No orders found</p>
            <p className="text-gray-500 mt-2">
              {filter === 'all' ? 'Orders will appear here' : `No ${filter} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6" data-testid={`order-${order.id}`}>
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{order.total_amount.toFixed(0)}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-gray-900 font-medium">₹{item.total_price.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                      <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Update Status:</p>
                    <div className="flex space-x-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                          disabled={updatingOrder === order.id}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed capitalize transition-colors"
                          data-testid={`update-${status}-${order.id}`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {updatingOrder === order.id && (
                  <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-600">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;