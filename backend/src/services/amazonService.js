const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to calculate sustainability score (simplified example)
const calculateSustainabilityScore = (productData) => {
  // This would be more complex in a real application
  // Could check for eco-friendly labels, materials, brand reputation, etc.
  let score = 3; // Default middle score
  
  // Example logic - check for keywords in the title or description
  const sustainabilityKeywords = ['eco', 'sustainable', 'organic', 'recycled', 'green'];
  for (const keyword of sustainabilityKeywords) {
    if (productData.title.toLowerCase().includes(keyword) || 
        (productData.description && productData.description.toLowerCase().includes(keyword))) {
      score += 1;
    }
  }
  
  return Math.min(5, score); // Cap at 5
};

exports.searchProducts = async (query) => {
  try {
    // Note: In a production environment, you would need to consider legal and ToS implications
    // of scraping e-commerce sites. You might need to use official APIs instead.
    
    // This is a simplified example for educational purposes
    const response = await axios.get(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // This selector would need to be updated based on Amazon's current HTML structure
    $('.s-result-item[data-asin]').each((i, el) => {
      const asin = $(el).attr('data-asin');
      if (!asin) return;
      
      const title = $(el).find('h2 span').text().trim();
      const priceText = $(el).find('.a-price .a-offscreen').first().text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      const imageUrl = $(el).find('img.s-image').attr('src');
      const url = 'https://www.amazon.com/dp/' + asin;
      
      if (title && price) {
        const productData = { id: asin, title, price, imageUrl, url };
        products.push({
          ...productData,
          sustainabilityLevel: calculateSustainabilityScore(productData)
        });
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error searching Amazon products:', error);
    return [];
  }
};

exports.getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`https://www.amazon.com/dp/${productId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('#productTitle').text().trim();
    const priceText = $('.a-price .a-offscreen').first().text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get multiple images
    const images = [];
    $('#altImages img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('sprite')) {
        // Convert thumbnail URL to full-size image URL
        const fullSizeUrl = src.replace(/_[S]C_\.\w+$/, '');
        images.push(fullSizeUrl);
      }
    });
    
    // Extract description
    const description = $('#productDescription p').text().trim();
    
    // Extract specifications
    const specs = {};
    $('#productDetails_techSpec_section_1 tr').each((i, el) => {
      const key = $(el).find('th').text().trim();
      const value = $(el).find('td').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });
    
    const productData = {
      id: productId,
      title,
      price,
      images: images.length > 0 ? images : [$('#landingImage').attr('src')],
      description,
      specs,
      url: `https://www.amazon.com/dp/${productId}`
    };
    
    return {
      ...productData,
      sustainabilityLevel: calculateSustainabilityScore(productData)
    };
  } catch (error) {
    console.error('Error getting Amazon product details:', error);
    throw error;
  }
};