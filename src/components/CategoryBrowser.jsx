
import { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';

export default function CategoryBrowser() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryClick = async (category) => {
    setLoading(true);
    setSelectedCategory(category);
    try {
      const response = await fetch(`/category_products/${category.id}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">🏷️</span>
          Browse Eco-Friendly Products by Category
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-center"
            >
              {category.icon && <span className="mr-2">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4">
            {selectedCategory.name} Products
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      )}
    </div>
  );
}
