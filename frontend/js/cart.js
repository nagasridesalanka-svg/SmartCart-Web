/**
 * SmartCart - Shopping Cart Manager (vanilla JS)
 * Manages client cart persistence, item counts, and badge synchronization.
 */

import { showToast } from './api.js';

const CART_STORAGE_KEY = 'smartcart_local_cart';

export const CartManager = {
  /**
   * Retrieves all items from cart
   */
  getItems() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Saves cart items and updates badges
   */
  saveItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this.updateBadges();
  },

  /**
   * Adds an item to the shopping cart
   */
  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existingIndex = items.findIndex(item => item.PRODUCT_ID === product.PRODUCT_ID);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        PRODUCT_ID: product.PRODUCT_ID,
        PRODUCT_NAME: product.PRODUCT_NAME,
        PRICE: product.PRICE,
        IMAGE_URL: product.IMAGE_URL,
        CATEGORY_NAME: product.CATEGORY_NAME,
        quantity: quantity
      });
    }

    this.saveItems(items);
    showToast(`Added "${product.PRODUCT_NAME}" to your cart.`, 'success');
  },

  /**
   * Total number of individual items in cart
   */
  getTotalCount() {
    const items = this.getItems();
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  /**
   * Calculates subtotal
   */
  getSubtotal() {
    const items = this.getItems();
    return items.reduce((total, item) => total + (item.PRICE * item.quantity), 0);
  },

  /**
   * Synchronizes cart badge count on all matching elements
   */
  updateBadges() {
    const count = this.getTotalCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// Initialize badges on page load
document.addEventListener('DOMContentLoaded', () => {
  CartManager.updateBadges();
});

window.CartManager = CartManager;
