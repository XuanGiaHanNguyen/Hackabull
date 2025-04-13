
export default function ProductGrid({ products }) {
  if (!products.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No products found in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <div key={index} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg transition hover:-translate-y-1">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          )}
          
          <div className="p-4">
            <h4 className="text-xl font-semibold text-green-400 mb-2">
              {product.name}
            </h4>
            
            {product.price && (
              <p className="text-lg font-bold mb-2">
                ${product.price.toFixed(2)}
              </p>
            )}
            
            <p className="text-gray-300 mb-4">
              {product.description}
            </p>

            {product.eco_features && (
              <div className="space-y-2 mb-4">
                {product.eco_features.map((feature, i) => (
                  <div key={i} className="flex items-center text-sm text-green-400">
                    <span className="mr-2">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                View Product
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
