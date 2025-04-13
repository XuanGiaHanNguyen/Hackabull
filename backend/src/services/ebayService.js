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
    // Use the correct eBay search URL format
    const response = await axios.get(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    const products = [];
    
    // Updated selector for current eBay HTML structure
    $('.s-item__wrapper').each((i, el) => {
      const linkElement = $(el).find('.s-item__link');
      if (!linkElement.length) return;
      
      const productUrl = linkElement.attr('href');
      if (!productUrl) return;
      
      // Extract ID from URL
      const urlMatch = productUrl.match(/\/(\d+)\?/);
      const id = urlMatch ? urlMatch[1] : null;
      if (!id) return;
      
      const title = $(el).find('.s-item__title').text().trim();
      const priceText = $(el).find('.s-item__price').text().trim();
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
      
      const imageUrl = $(el).find('.s-item__image-img').attr('src');
      
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
    console.error('Error searching ebay products:', error);
    return [];
  }
};

exports.getProductDetails = async (productId) => {
  try {
    // Correct eBay item URL format
    const url = `https://www.ebay.com/itm/${productId}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('.x-item-title__mainTitle').text().trim();
    const priceText = $('.x-price-primary').text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : null;
    
    // Get images - updated selectors
    const images = [];
    $('.ux-image-carousel-item img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        images.push(src);
      }
    });
    
    // Backup for image if main carousel not found
    if (images.length === 0) {
      const mainImage = $('.ux-image-carousel img').attr('src');
      if (mainImage) {
        images.push(mainImage);
      }
    }
    
    // Extract description
    const description = $('#tab1 .product-description').text().trim() || 
                        $('.d-item-description-wrapper').text().trim();
    
    // Extract specifications
    const specs = {};
    $('.x-product-details__table tr').each((i, el) => {
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
    console.error('Error getting ebay product details:', error);
    throw error;
  }
};