const amazonService = require('../services/amazonService');
const flipkartService = require('../services/flipkartService');
const snapdealService = require('../services/snapdealService');

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Fetch products from different services in parallel
    const [amazonProducts, flipkartProducts, snapdealProducts] = await Promise.all([
      amazonService.searchProducts(query),
      flipkartService.searchProducts(query),
      snapdealService.searchProducts(query)
    ]);

    // Combine and format results
    const allProducts = [
      ...amazonProducts.map(p => ({ ...p, source: 'amazon' })),
      ...flipkartProducts.map(p => ({ ...p, source: 'flipkart' })),
      ...snapdealProducts.map(p => ({ ...p, source: 'snapdeal' }))
    ];

    res.json({ products: allProducts });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search for products' });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const { source } = req.query;

    if (!productId || !source) {
      return res.status(400).json({ error: 'Product ID and source are required' });
    }

    let productDetails;
    
    // Get details from the appropriate service
    switch (source) {
      case 'amazon':
        productDetails = await amazonService.getProductDetails(productId);
        break;
      case 'flipkart':
        productDetails = await flipkartService.getProductDetails(productId);
        break;
      case 'snapdeal':
        productDetails = await snapdealService.getProductDetails(productId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid source' });
    }

    res.json({ product: productDetails });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
};