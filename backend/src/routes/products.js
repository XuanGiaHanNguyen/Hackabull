const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Search for products
router.get('/search', productController.searchProducts);

// Get product details
router.get('/details/:productId', productController.getProductDetails);

module.exports = router;