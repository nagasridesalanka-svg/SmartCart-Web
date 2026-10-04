/**
 * SmartCart - Orders Routes
 * Requires authentication for all endpoints
 */

import express from 'express';
import orderController from '../controllers/orderController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// POST /api/orders
router.post('/', orderController.placeOrder);

// GET /api/orders
router.get('/', orderController.getUserOrders);

export default router;
