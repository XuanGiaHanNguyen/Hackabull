const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (productData) => {
  let score = 3; // Default middle score
  
  const sustainabilityKeywords = ['eco', 'sustainable', 'organic', 'recycled', 'green'];
  for (const keyword of sustainabilityKeywords) {
    if (productData.title?.toLowerCase().includes(keyword) || 
        (productData.description && productData.description.toLowerCase().includes(keyword))) {
      score += 1;
    }
  }
  
  return Math.min(5, score); // Cap at 5
};

exports.searchProducts = async (query) => {
  try {
    // Correct Walmart search URL
    const response = await axios.get(`https://www.walmart.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // Updated selector for current Walmart HTML structure
    $('div[data-item-id]').each((i, el) => {
      const id = $(el).attr('data-item-id');
      if (!id) return;
      
      const linkElement = $(el).find('a[link-identifier="linkProductTitle"]');
      if (!linkElement.length) return;
      
      const productUrl = 'https://www.walmart.com' + linkElement.attr('href');
      
      const title = linkElement.text().trim();
      if (!title) return;
      
      const priceText = $(el).find('span[data-automation-id="product-price"]').text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      
      const imageUrl = $(el).find('img[data-testid="product-image"]').attr('src');
      
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
    console.error('Error searching walmart products:', error);
    return [];
  }
};

exports.getProductDetails = async (productId) => {
  try {
    // Correct Walmart product URL format
    const url = `https://www.walmart.com/ip/${productId}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('h1[itemprop="name"]').text().trim();
    const priceText = $('span[itemprop="price"]').text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get images
    const images = [];
    $('img.hover-zoom-hero-image').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        images.push(src);
      }
    });
    
    // Get main image if no carousel images were found
    if (images.length === 0) {
      const mainImage = $('img[data-testid="main-image"]').attr('src');
      if (mainImage) {
        images.push(mainImage);
      }
    }
    
    // Extract description
    const description = $('div[itemprop="description"]').text().trim();
    
    // Extract specifications
    const specs = {};
    $('.specification-table td').each((i, el) => {
      if (i % 2 === 0) {
        const key = $(el).text().trim();
        const value = $(el).next().text().trim();
        if (key && value) {
          specs[key] = value;
        }
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
    console.error('Error getting walmart product details:', error);
    throw error;
  }
};