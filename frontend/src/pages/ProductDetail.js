import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Truck, Star, MapPin, Package, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { productsAPI, cartAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ui/ImageGallery';
import SustainabilityInfo from '../components/ui/SustainabilityInfo';
import ProductCard from '../components/ui/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productsAPI.getById(id);
      setProduct(res.data);

      // Load similar products (same category)
      const similarRes = await productsAPI.getAll({ 
        category_id: res.data.category_id, 
        limit: 4 
      });
      // Filter out current product
      setSimilarProducts(similarRes.data.filter(p => p.id !== id).slice(0, 3));
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (quantity > product.stock_quantity) {
      setError(`Only ${product.stock_quantity} units available`);
      return;
    }

    setAddingToCart(true);
    setError('');
    
    try {
      await cartAPI.add({ product_id: product.id, quantity });
      setShowSuccess(true);
      
      // Refresh cart count in navbar
      if (window.refreshCartCount) {
        window.refreshCartCount();
      }
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/products" className="text-green-600 hover:text-green-700 font-medium">
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          data-testid="back-button"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white rounded-lg shadow-2xl p-4 flex items-center space-x-3 animate-slide-in" data-testid="success-message">
            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Added to cart!</p>
              <p className="text-sm text-green-100">{quantity} {quantity > 1 ? 'items' : 'item'} added</p>
            </div>
            <Link 
              to="/cart" 
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
            >
              View Cart
            </Link>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3" data-testid="error-message">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div>
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Price */}
            <div>
              <div className="mb-2">
                <Link
                  to={`/products?category_id=${product.category_id}`}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {product.category_name}
                </Link>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" data-testid="product-title">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-gray-900" data-testid="product-price">
                  ₹{product.price.toFixed(0)}
                </span>
                <span className="text-xl text-gray-500">/ {product.unit}</span>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sold by</p>
                  <p className="text-lg font-semibold text-gray-900">{product.vendor_name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {product.vendor_rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{product.vendor_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Package className="h-10 w-10 text-gray-400" />
              </div>
            </div>

            {/* Stock & Delivery */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Truck className="h-5 w-5" />
                <span>Delivery in {product.delivery_days} days</span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-2 font-medium" data-testid="quantity-display">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Sustainability Info */}
        <div className="mb-12">
          <SustainabilityInfo sustainability={product.sustainability} />
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;