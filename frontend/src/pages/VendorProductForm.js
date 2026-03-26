import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../api/client';
import VendorLayout from '../components/ui/VendorLayout';

const VendorProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    unit: 'piece',
    images: [''],
    stock_quantity: '',
    delivery_days: '7',
    sustainability: {
      is_recycled: false,
      is_low_carbon: false,
      is_energy_efficient: false,
      co2_savings_kg: '',
      certifications: [''],
    },
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async () => {
    try {
      const res = await productsAPI.getById(id);
      const product = res.data;
      setFormData({
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        unit: product.unit,
        images: product.images.length > 0 ? product.images : [''],
        stock_quantity: product.stock_quantity.toString(),
        delivery_days: product.delivery_days.toString(),
        sustainability: {
          ...product.sustainability,
          co2_savings_kg: product.sustainability.co2_savings_kg?.toString() || '',
          certifications: product.sustainability.certifications.length > 0 
            ? product.sustainability.certifications 
            : [''],
        },
      });
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        delivery_days: parseInt(formData.delivery_days),
        images: formData.images.filter(img => img.trim() !== ''),
        sustainability: {
          ...formData.sustainability,
          co2_savings_kg: formData.sustainability.co2_savings_kg 
            ? parseFloat(formData.sustainability.co2_savings_kg) 
            : null,
          certifications: formData.sustainability.certifications.filter(cert => cert.trim() !== ''),
        },
      };

      if (isEdit) {
        // For edit, we'd need an update endpoint (not implemented in backend yet)
        setError('Edit functionality coming soon');
      } else {
        await productsAPI.create(productData);
        navigate('/vendor/products');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('sustainability.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        sustainability: {
          ...formData.sustainability,
          [field]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
  };

  const handleCertificationChange = (index, value) => {
    const newCerts = [...formData.sustainability.certifications];
    newCerts[index] = value;
    setFormData({
      ...formData,
      sustainability: { ...formData.sustainability, certifications: newCerts },
    });
  };

  const addCertificationField = () => {
    setFormData({
      ...formData,
      sustainability: {
        ...formData.sustainability,
        certifications: [...formData.sustainability.certifications, ''],
      },
    });
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/vendor/products')}
            className="p-2 hover:bg-gray-100 rounded-lg"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Eco-Friendly Paint"
                  data-testid="product-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  data-testid="category-select"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Detailed product description"
                data-testid="description-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="450"
                  data-testid="price-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  data-testid="unit-select"
                >
                  <option value="piece">Piece</option>
                  <option value="litre">Litre</option>
                  <option value="kg">Kilogram</option>
                  <option value="sq ft">Square Feet</option>
                  <option value="50kg bag">50kg Bag</option>
                  <option value="set">Set</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="100"
                  data-testid="stock-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Days *
              </label>
              <input
                type="number"
                name="delivery_days"
                value={formData.delivery_days}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="7"
                data-testid="delivery-days-input"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
            <p className="text-sm text-gray-600">Add image URLs (Unsplash or other sources)</p>
            {formData.images.map((image, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://images.unsplash.com/..."
                  data-testid={`image-input-${index}`}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              + Add Another Image
            </button>
          </div>

          {/* Sustainability */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Sustainability (Optional)</h2>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="sustainability.is_recycled"
                  checked={formData.sustainability.is_recycled}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="is-recycled-checkbox"
                />
                <span className="text-gray-700">Made from recycled materials</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="sustainability.is_low_carbon"
                  checked={formData.sustainability.is_low_carbon}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="is-low-carbon-checkbox"
                />
                <span className="text-gray-700">Low carbon production</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="sustainability.is_energy_efficient"
                  checked={formData.sustainability.is_energy_efficient}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="is-energy-efficient-checkbox"
                />
                <span className="text-gray-700">Energy efficient</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CO₂ Savings (kg)
              </label>
              <input
                type="number"
                name="sustainability.co2_savings_kg"
                value={formData.sustainability.co2_savings_kg}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="2.5"
                data-testid="co2-savings-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              {formData.sustainability.certifications.map((cert, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Green Seal Certified"
                    data-testid={`certification-input-${index}`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCertificationField}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                + Add Certification
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="save-product-button"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{isEdit ? 'Update' : 'Create'} Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
};

export default VendorProductForm;
