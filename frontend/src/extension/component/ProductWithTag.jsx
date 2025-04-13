import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * A fixed-position tag component that attaches to the screen
 * regardless of scrolling
 */
const FixedProductTag = () => {
  // State for tag data
  const [tagData, setTagData] = useState({
    tag: "High Carbon Footprint",
    color: "#e74c3c",
    icon: "🌡️"
  });
  const [showInfo, setShowInfo] = useState(false);

  // Toggle info popup
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };
  
  return (
    <div 
      className="fixed-tag-container" 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}
    >
      <div 
        className="fixed-product-tag" 
        style={{
          backgroundColor: tagData.color,
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
        onClick={toggleInfo}
      >
        <span style={{ marginRight: '8px' }}>{tagData.icon}</span>
        {tagData.tag}
      </div>
      
      {showInfo && (
        <div 
          className="tag-info-popup"
          style={{
            position: 'absolute',
            bottom: '100%',
            right: '0',
            marginBottom: '10px',
            backgroundColor: 'white',
            border: `1px solid ${tagData.color}`,
            borderRadius: '4px',
            padding: '15px',
            width: '300px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 100
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: tagData.color }}>{tagData.tag}</h4>
          <p style={{ margin: '0 0 10px 0', lineHeight: '1.5' }}>
            This product has a significant environmental impact due to manufacturing 
            processes and materials used.
          </p>
          <button 
            style={{
              background: tagData.color,
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(false);
              console.log('User requested more information about sustainability ratings');
            }}
          >
            Learn more about sustainability ratings
          </button>
        </div>
      )}
    </div>
  );
};

// Function to inject the tag into the page
const injectFixedTag = () => {
  // Create a container for our React component
  const tagContainer = document.createElement('div');
  tagContainer.id = 'product-tag-root';
  document.body.appendChild(tagContainer);
  
  // Render our component
  ReactDOM.render(<FixedProductTag />, tagContainer);
  
  console.log('Fixed product tag injected');
};

// Export both the component and the injection function
export { FixedProductTag, injectFixedTag };

// If this file is loaded directly as a content script, inject the tag
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  window.addEventListener('load', () => {
    setTimeout(injectFixedTag, 1000);
  });
}

export default FixedProductTag;