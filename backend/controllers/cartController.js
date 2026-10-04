/**
 * SmartCart - Shopping Cart Controller
 * Handles server-side shopping cart operations:
 * GET /api/cart
 * POST /api/cart/add
 * PUT /api/cart/update
 * DELETE /api/cart/remove
 */

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const cartController = {
  /**
   * GET /api/cart
   * Retrieves current user's cart
   */
  async getCart(req, res) {
    try {
      const cart = Cart.findByUserId(req.user.USER_ID);
      return res.status(200).json({
        success: true,
        items: cart.items,
        subtotal: cart.subtotal,
        totalItems: cart.totalItems
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve shopping cart.'
      });
    }
  },

  /**
   * POST /api/cart/add
   * Adds product to cart or increments quantity
   */
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required.'
        });
      }

      const product = Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      if (product.STOCK_QUANTITY <= 0) {
        return res.status(400).json({
          success: false,
          message: `"${product.PRODUCT_NAME}" is currently out of stock.`
        });
      }

      const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);
      const cart = Cart.addItem(req.user.USER_ID, productId, parsedQty);

      return res.status(200).json({
        success: true,
        message: `Added "${product.PRODUCT_NAME}" to your cart.`,
        items: cart.items,
        subtotal: cart.subtotal,
        totalItems: cart.totalItems
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add item to cart.'
      });
    }
  },

  /**
   * PUT /api/cart/update
   * Updates an item's quantity
   */
  async updateCart(req, res) {
    try {
      const { cartId, productId, quantity } = req.body;

      if (!cartId && !productId) {
        return res.status(400).json({
          success: false,
          message: 'Cart ID or Product ID is required.'
        });
      }

      if (quantity === undefined || quantity === null) {
        return res.status(400).json({
          success: false,
          message: 'Quantity is required.'
        });
      }

      const parsedQty = parseInt(quantity, 10);
      const cart = Cart.updateQuantity(req.user.USER_ID, {
        cartId,
        productId,
        quantity: parsedQty
      });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cart updated successfully.',
        items: cart.items,
        subtotal: cart.subtotal,
        totalItems: cart.totalItems
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update cart.'
      });
    }
  },

  /**
   * DELETE /api/cart/remove
   * Removes an item from the cart
   */
  async removeFromCart(req, res) {
    try {
      const cartId = req.body.cartId || req.query.cartId;
      const productId = req.body.productId || req.query.productId;

      if (!cartId && !productId) {
        return res.status(400).json({
          success: false,
          message: 'Cart ID or Product ID is required.'
        });
      }

      Cart.removeItem(req.user.USER_ID, { cartId, productId });
      const cart = Cart.findByUserId(req.user.USER_ID);

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        items: cart.items,
        subtotal: cart.subtotal,
        totalItems: cart.totalItems
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart.'
      });
    }
  }
};

export default cartController;
