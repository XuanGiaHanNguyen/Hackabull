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
    const response = await axios.get(`https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // This selector would need to be updated based on Snapdeal's current HTML structure
    $('.product-tuple-listing').each((i, el) => {
      const linkElement = $(el).find('a.dp-widget-link');
      if (!linkElement.length) return;
      
      const productUrl = linkElement.attr('href');
      if (!productUrl) return;
      
      // Extract ID from URL
      const urlParts = productUrl.split('/');
      const id = urlParts[urlParts.length - 1].split('?')[0];
      
      const title = $(el).find('.product-title').text().trim();
      const priceText = $(el).find('.product-price').text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      
      const imageUrl = $(el).find('.product-image img').attr('src');
      
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
    console.error('Error searching Snapdeal products:', error);
    return [];
  }
};

exports.getProductDetails = async (productId) => {
  try {
    // Construct URL from ID - this is a simplified approach
    const url = `https://www.snapdeal.com/product/${productId}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('h1.pdp-e-i-head').text().trim();
    const priceText = $('span.payBlkBig').text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get images
    const images = [];
    $('#bx-pager a img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        // Convert thumbnail URL to full-size image URL
        const fullSizeUrl = src.replace('-55-55', '-512-512');
        images.push(fullSizeUrl);
      }
    });
    
    // If no thumbnails, try to get main image
    if (images.length === 0) {
      const mainImage = $('.cloudzoom').attr('src');
      if (mainImage) {
        images.push(mainImage);
      }
    }
    
    // Extract description
    const description = $('.detailssubbox').text().trim();
    
    // Extract specifications
    const specs = {};
    $('.spec-body tr').each((i, el) => {
      const key = $(el).find('td.spec-title').text().trim();
      const value = $(el).find('td.spec-value').text().trim();
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
    console.error('Error getting Snapdeal product details:', error);
    throw error;
  }
};