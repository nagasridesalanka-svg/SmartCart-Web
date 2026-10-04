/**
 * SmartCart - Shopping Cart Routes
 * All endpoints require valid JWT authentication
 */

import express from 'express';
import cartController from '../controllers/cartController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Enforce login on all cart endpoints
router.use(authenticate);

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart/add
router.post('/add', cartController.addToCart);

// PUT /api/cart/update
router.put('/update', cartController.updateCart);

// DELETE /api/cart/remove
router.delete('/remove', cartController.removeFromCart);

export default router;
