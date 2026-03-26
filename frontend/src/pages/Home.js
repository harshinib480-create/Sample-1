import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, MapPin, Leaf } from 'lucide-react';
import { categoriesAPI, productsAPI } from '../api/client';
import CategoryCard from '../components/ui/CategoryCard';
import ProductCard from '../components/ui/ProductCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [ecoProducts, setEcoProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const categoriesRes = await categoriesAPI.getAll();
      setCategories(categoriesRes.data);

      // Load featured products (first 6)
      const featuredRes = await productsAPI.getAll({ limit: 6 });
      setFeaturedProducts(featuredRes.data);

      // Load eco-friendly products
      const ecoRes = await productsAPI.getAll({ is_sustainable: true, limit: 4 });
      setEcoProducts(ecoRes.data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="hero-title">
              Build Your Dream Home
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-green-50">
              Quality construction materials with sustainability insights
            </p>
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                data-testid="get-started-button"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Section */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Eco-Friendly Products */}
        <section className="py-12 bg-green-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Eco-Friendly Picks</h2>
                  <p className="text-sm text-gray-600">Sustainable materials for a better tomorrow</p>
                </div>
              </div>
              <Link
                to="/products?is_sustainable=true"
                className="hidden sm:flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium"
                data-testid="view-all-eco-button"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ecoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Link
              to="/products?is_sustainable=true"
              className="sm:hidden flex items-center justify-center space-x-1 mt-6 text-green-600 hover:text-green-700 font-medium"
            >
              <span>View All Eco-Friendly Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium"
              data-testid="view-all-products-button"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link
            to="/products"
            className="sm:hidden flex items-center justify-center space-x-1 mt-6 text-green-600 hover:text-green-700 font-medium"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            Why Choose BuildMart?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Compare prices from multiple verified vendors to get the best deals
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainability First</h3>
              <p className="text-gray-600">
                Track your CO₂ savings and choose eco-friendly materials easily
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Vendors</h3>
              <p className="text-gray-600">
                Find trusted suppliers in your area for faster delivery
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;