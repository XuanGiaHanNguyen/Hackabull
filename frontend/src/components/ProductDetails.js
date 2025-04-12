import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

function ProductDetails() {
  const { source, id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/details/${id}`,
          { params: { source } }
        );
        setProduct(response.data.product);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, source]);

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
        <span className="sustainability-text">Sustainability Score: {level}/5</span>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-details">
      <div className="product-images-container">
        <div className="main-image">
          <img 
            src={product.images[selectedImage]} 
            alt={product.title} 
          />
        </div>
        {product.images.length > 1 && (
          <div className="thumbnail-container">
            {product.images.map((image, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <h1 className="product-title">{product.title}</h1>
        <p className="product-price">${product.price}</p>
        {renderSustainabilityLevel(product.sustainabilityLevel)}
        
        {product.description && (
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
        )}
        
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="product-specifications">
            <h3>Specifications</h3>
            <table>
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="product-actions">
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="buy-button"
          >
            View on {source.charAt(0).toUpperCase() + source.slice(1)}
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;