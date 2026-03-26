import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { cartAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

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
      setCart(res.data);
      
      // Refresh navbar cart count
      if (window.refreshCartCount) {
        window.refreshCartCount();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    setUpdating(cartItemId);
    try {
      await cartAPI.remove(cartItemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateQuantity = async (cartItemId, productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    setUpdating(cartItemId);
    try {
      // Remove old cart item
      await cartAPI.remove(cartItemId);
      // Add with new quantity
      await cartAPI.add({ product_id: productId, quantity: newQuantity });
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <ShoppingCart className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900" data-testid="cart-title">
            Shopping Cart
          </h1>
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started</p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              data-testid="continue-shopping-button"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="bg-white rounded-lg shadow-md p-6"
                  data-testid={`cart-item-${item.cart_item_id}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-green-600 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{item.product.vendor_name}</p>
                      <div className="mt-2">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{item.product.price.toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-500"> / {item.product.unit}</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end space-y-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cart_item_id,
                              item.product.id,
                              item.quantity,
                              -1
                            )
                          }
                          disabled={updating === item.cart_item_id || item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid={`decrease-${item.cart_item_id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-medium" data-testid={`quantity-${item.cart_item_id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cart_item_id,
                              item.product.id,
                              item.quantity,
                              1
                            )
                          }
                          disabled={updating === item.cart_item_id}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid={`increase-${item.cart_item_id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{item.item_total.toFixed(0)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.cart_item_id)}
                        disabled={updating === item.cart_item_id}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        data-testid={`remove-${item.cart_item_id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cart.items.length})</span>
                    <span>₹{cart.total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900" data-testid="cart-total">
                    ₹{cart.total.toFixed(0)}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  data-testid="proceed-to-checkout-button"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  to="/products"
                  className="block text-center mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;