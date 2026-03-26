import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

const CategoryCard = ({ category }) => {
  // Get icon component dynamically
  const IconComponent = Icons[category.icon] || Icons.Package;

  return (
    <Link
      to={`/products?category_id=${category.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-500"
      data-testid={`category-card-${category.id}`}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
          <IconComponent className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;