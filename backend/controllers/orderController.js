/**
 * SmartCart - Orders Controller
 * Handles checkout order placement and order history retrieval.
 */

import Order from '../models/Order.js';

export const orderController = {
  /**
   * POST /api/orders
   * Places an order atomically from the user's active shopping cart.
   */
  async placeOrder(req, res) {
    try {
      const { shippingAddress, paymentMethod } = req.body;

      if (!shippingAddress || !shippingAddress.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Shipping delivery address is required.'
        });
      }

      const result = Order.createOrder({
        userId: req.user.USER_ID,
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod || 'Card'
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: result
      });
    } catch (error) {
      console.error('Order placement error:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to place order.'
      });
    }
  },

  /**
   * GET /api/orders
   * Retrieves order history for the authenticated user.
   */
  async getUserOrders(req, res) {
    try {
      const orders = Order.findByUserId(req.user.USER_ID);
      return res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve order history.'
      });
    }
  }
};

export default orderController;
