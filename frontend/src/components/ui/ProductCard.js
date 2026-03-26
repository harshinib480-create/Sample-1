import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Leaf, Truck, TrendingUp } from 'lucide-react';

const ProductCard = ({ product }) => {
  const hasSustainability = 
    product.sustainability?.is_recycled || 
    product.sustainability?.is_low_carbon || 
    product.sustainability?.is_energy_efficient;

  const sustainabilityLabel = () => {
    if (product.sustainability?.is_recycled) return 'Recycled';
    if (product.sustainability?.is_low_carbon) return 'Low Carbon';
    if (product.sustainability?.is_energy_efficient) return 'Energy Efficient';
    return 'Eco-Friendly';
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-500"
      data-testid={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasSustainability && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Leaf className="h-3 w-3" />
            <span>{sustainabilityLabel()}</span>
          </div>
        )}
        {product.sustainability?.co2_savings_kg && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-green-700">
            Saves {product.sustainability.co2_savings_kg}kg CO₂
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Vendor Info */}
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
          <span>{product.vendor_name}</span>
          {product.vendor_rating > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span>{product.vendor_rating.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">₹{product.price.toFixed(0)}</span>
          <span className="text-sm text-gray-500">/{product.unit}</span>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <Truck className="h-4 w-4" />
            <span>{product.delivery_days} days</span>
          </div>
          {product.stock_quantity > 0 ? (
            <span className="text-green-600 font-medium">In Stock</span>
          ) : (
            <span className="text-red-600 font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;