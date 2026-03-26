import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingBag, AlertCircle, Loader } from 'lucide-react';
import { cartAPI, ordersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    if (isAuthenticated) {
      loadCart();
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.get();
      if (res.data.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(res.data);
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);

    try {
      // Format address
      const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`;

      // Prepare order items (group by vendor)
      const vendorGroups = {};
      cart.items.forEach((item) => {
        const vendorId = item.product.vendor_id;
        if (!vendorGroups[vendorId]) {
          vendorGroups[vendorId] = [];
        }
        vendorGroups[vendorId].push({
          product_id: item.product.id,
          quantity: item.quantity,
        });
      });

      // Create orders (one per vendor)
      const orderPromises = Object.keys(vendorGroups).map((vendorId) =>
        ordersAPI.create({
          items: vendorGroups[vendorId],
          delivery_address: fullAddress,
        })
      );

      const orders = await Promise.all(orderPromises);

      // Redirect to success page with first order ID
      navigate(`/order-success/${orders[0].data.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="checkout-title">
            Checkout
          </h1>
          <p className="text-gray-600 mt-1">Complete your order</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123 Main Street, Apartment 4B"
                    data-testid="street-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Mumbai"
                      data-testid="city-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Maharashtra"
                      data-testid="state-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                    required
                    pattern="[0-9]{6}"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="400001"
                    data-testid="pincode-input"
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Test Mode:</strong> Payment processing is currently in test mode. Your order will be
                  placed without actual payment.
                </p>
              </div>

              <div className="mt-4 p-4 border-2 border-green-500 rounded-lg bg-green-50">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="w-5 h-5 text-green-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.cart_item_id} className="flex items-start space-x-3">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/50'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity} x ₹{item.product.price.toFixed(0)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{item.item_total.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cart.total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900" data-testid="checkout-total">
                  ₹{cart.total.toFixed(0)}
                </span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="place-order-button"
              >
                {placing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <Link to="/cart" className="block text-center mt-4 text-green-600 hover:text-green-700 font-medium">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;