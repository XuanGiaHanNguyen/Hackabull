import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/search`, {
        params: { query }
      });
      
      setProducts(response.data.products);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSustainabilityLevel = (level) => {
    const levels = [];
    for (let i = 1; i <= 5; i++) {
      levels.push(
        <span 
          key={i} 
          className={`sustainability-dot ${i <= level ? 'active' : ''}`}
        />
      );
    }
    return (
      <div className="sustainability-indicator">
        {levels}
        <span className="sustainability-text">Sustainability: {level}/5</span>
      </div>
    );
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h2>Compare Products Across Multiple Stores</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && products.length > 0 && (
        <div className="results-container">
          <h3>Search Results</h3>
          <div className="product-grid">
            {products.map((product) => (
              <div key={`${product.source}-${product.id}`} className="product-card">
                <div className="product-image">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.title} />
                  )}
                  <div className="product-source">{product.source}</div>
                </div>
                <div className="product-info">
                  <h4 className="product-title">{product.title}</h4>
                  <p className="product-price">${product.price}</p>
                  {renderSustainabilityLevel(product.sustainabilityLevel)}
                  <Link 
                    to={`/product/${product.source}/${product.id}`} 
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && query && products.length === 0 && (
        <div className="no-results">No products found. Try a different search term.</div>
      )}
    </div>
  );
}

export default SearchPage;