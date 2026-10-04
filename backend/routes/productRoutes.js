/**
 * SmartCart - Product & Category Routes
 * Public endpoints for product catalog browsing
 */

import { Router } from 'express';
import productController from '../controllers/productController.js';

const router = Router();

// GET /api/categories - List all categories
router.get('/categories', productController.getCategories);

// GET /api/products - List products with optional search and category filters
router.get('/products', productController.getProducts);

// GET /api/products/:id - Single product details
router.get('/products/:id', productController.getProductById);

export default router;
