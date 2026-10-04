/**
 * SmartCart - Shopping Cart Manager (vanilla JS)
 * Manages server-side cart API communication, item counts, and live badge synchronization.
 */

import { api, AuthStorage, showToast } from './api.js';

export const CartManager = {
  cartState: {
    items: [],
    subtotal: 0,
    totalItems: 0
  },

  listeners: new Set(),

  /**
   * Register a listener for cart state updates
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },

  /**
   * Notify registered listeners of cart state changes
   */
  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.cartState);
      } catch (err) {
        console.error('Cart listener error:', err);
      }
    });
  },

  /**
   * Synchronizes cart badge count on all matching DOM elements
   */
  updateBadges(count = null) {
    const finalCount = count !== null ? count : (this.cartState.totalItems || 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = finalCount;
      badge.style.display = finalCount > 0 ? 'flex' : 'none';
    });
  },

  /**
   * Checks if user is authenticated; if not, redirects to login
   */
  requireAuth(redirectTarget = null) {
    if (!AuthStorage.isAuthenticated()) {
      showToast('Please sign in to view and manage your shopping cart.', 'info');
      const target = redirectTarget || (window.location.pathname + window.location.search);
      setTimeout(() => {
        window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
      }, 500);
      return false;
    }
    return true;
  },

  /**
   * Fetches latest cart from server
   */
  async fetchCart() {
    if (!AuthStorage.isAuthenticated()) {
      this.cartState = { items: [], subtotal: 0, totalItems: 0 };
      this.updateBadges(0);
      return this.cartState;
    }

    try {
      const res = await api.get('/cart');
      this.cartState = {
        items: res.items || [],
        subtotal: Number(res.subtotal) || 0,
        totalItems: Number(res.totalItems) || 0
      };
      this.updateBadges(this.cartState.totalItems);
      this.notify();
      return this.cartState;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      if (error.message && error.message.toLowerCase().includes('token')) {
        AuthStorage.clear();
      }
      return this.cartState;
    }
  },

  /**
   * Adds an item to the shopping cart via POST /api/cart/add
   */
  async addItem(productOrId, quantity = 1) {
    if (!this.requireAuth()) {
      return null;
    }

    const productId = typeof productOrId === 'object' && productOrId !== null
      ? productOrId.PRODUCT_ID
      : Number(productOrId);

    const productName = typeof productOrId === 'object' && productOrId !== null
      ? productOrId.PRODUCT_NAME
      : `Product #${productId}`;

    try {
      const res = await api.post('/cart/add', {
        productId,
        quantity: Math.max(1, parseInt(quantity, 10) || 1)
      });

      this.cartState = {
        items: res.items || [],
        subtotal: Number(res.subtotal) || 0,
        totalItems: Number(res.totalItems) || 0
      };

      this.updateBadges(this.cartState.totalItems);
      this.notify();
      showToast(res.message || `Added "${productName}" to your cart.`, 'success');
      return this.cartState;
    } catch (error) {
      showToast(error.message || 'Could not add item to cart.', 'error');
      throw error;
    }
  },

  /**
   * Updates an item's quantity via PUT /api/cart/update
   */
  async updateQuantity(cartId, quantity) {
    if (!this.requireAuth()) {
      return null;
    }

    try {
      const res = await api.put('/cart/update', {
        cartId: Number(cartId),
        quantity: parseInt(quantity, 10)
      });

      this.cartState = {
        items: res.items || [],
        subtotal: Number(res.subtotal) || 0,
        totalItems: Number(res.totalItems) || 0
      };

      this.updateBadges(this.cartState.totalItems);
      this.notify();
      return this.cartState;
    } catch (error) {
      showToast(error.message || 'Could not update item quantity.', 'error');
      throw error;
    }
  },

  /**
   * Removes an item from the cart via DELETE /api/cart/remove
   */
  async removeItem(cartId) {
    if (!this.requireAuth()) {
      return null;
    }

    try {
      const res = await api.delete('/cart/remove', {
        cartId: Number(cartId)
      });

      this.cartState = {
        items: res.items || [],
        subtotal: Number(res.subtotal) || 0,
        totalItems: Number(res.totalItems) || 0
      };

      this.updateBadges(this.cartState.totalItems);
      this.notify();
      showToast('Item removed from cart.', 'info');
      return this.cartState;
    } catch (error) {
      showToast(error.message || 'Could not remove item from cart.', 'error');
      throw error;
    }
  }
};

// Initialize badges on page load
document.addEventListener('DOMContentLoaded', () => {
  CartManager.fetchCart();
});

window.CartManager = CartManager;
