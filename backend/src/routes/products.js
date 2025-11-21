const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// List products
router.get('/', productController.listProducts);
// Get product by id
router.get('/:id', productController.getProduct);
// Create product
router.post('/', productController.createProduct);
// Update product
router.put('/:id', productController.updateProduct);
// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
