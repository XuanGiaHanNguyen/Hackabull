const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (productData) => {
  // This would be more complex in a real application
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
    const response = await axios.get(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // This selector would need to be updated based on Flipkart's current HTML structure
    $('div._1AtVbE').each((i, el) => {
      const linkElement = $(el).find('a._1fQZEK');
      if (!linkElement.length) return;
      
      const productUrl = 'https://www.flipkart.com' + linkElement.attr('href');
      const id = productUrl.split('/').pop().split('?')[0];
      
      const title = $(el).find('div._4rR01T').text().trim();
      if (!title) return;
      
      const priceText = $(el).find('div._30jeq3').text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      
      const imageUrl = $(el).find('img._396cs4').attr('src');
      
      if (title && price) {
        const productData = { id, title, price, imageUrl, url: productUrl };
        products.push({
          ...productData,
          sustainabilityLevel: calculateSustainabilityScore(productData)
        });
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error searching Flipkart products:', error);
    return [];
  }
};

exports.getProductDetails = async (productId) => {
  try {
    // Construct URL from ID - this is a simplified approach
    const url = `https://www.flipkart.com/product/${productId}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('span.B_NuCI').text().trim();
    const priceText = $('div._30jeq3._16Jk6d').text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get images
    const images = [];
    $('img.q6DClP').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        images.push(src);
      }
    });
    
    // Get main image if no thumbnails were found
    if (images.length === 0) {
      const mainImage = $('div._3kidJX img').attr('src');
      if (mainImage) {
        images.push(mainImage);
      }
    }
    
    // Extract description
    const description = $('div._1mXcCf p').text().trim();
    
    // Extract specifications
    const specs = {};
    $('div._14cfVK').each((i, el) => {
      const key = $(el).find('td:nth-child(1)').text().trim();
      const value = $(el).find('td:nth-child(2)').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });
    
    const productData = {
      id: productId,
      title,
      price,
      images,
      description,
      specs,
      url
    };
    
    return {
      ...productData,
      sustainabilityLevel: calculateSustainabilityScore(productData)
    };
  } catch (error) {
    console.error('Error getting Flipkart product details:', error);
    throw error;
  }
};