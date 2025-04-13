const amazonService = require('../services/amazonService');
const walmartService = require('../services/walmartService');
const ebayService = require('../services/ebayService');

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Fetch products from different services in parallel
    const [amazonProducts, walmartProducts, ebayProducts] = await Promise.all([
      amazonService.searchProducts(query),
      walmartService.searchProducts(query),
      ebayService.searchProducts(query)
    ]);

    // Combine and format results
    const allProducts = [
      ...amazonProducts.map(p => ({ ...p, source: 'amazon' })),
      ...walmartProducts.map(p => ({ ...p, source: 'walmart' })),
      ...ebayProducts.map(p => ({ ...p, source: 'ebay' }))
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
      case 'walmart':
        productDetails = await walmartService.getProductDetails(productId);
        break;
      case 'ebay':
        productDetails = await ebayService.getProductDetails(productId);
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