/**
 * SmartCart - Shopping Cart Model
 * Maps to SHOPPING_CART(CART_ID, USER_ID, PRODUCT_ID, QUANTITY, ADDED_AT)
 */

import db from '../config/db.js';
import Product from './Product.js';

const Cart = {
  /**
   * Retrieves all items in the user's cart joined with product details
   */
  findByUserId(userId) {
    const rawItems = db.table('SHOPPING_CART').find(item => item.USER_ID === Number(userId));
    const items = [];
    let subtotal = 0;
    let totalItems = 0;

    for (const item of rawItems) {
      const product = Product.findById(item.PRODUCT_ID);
      if (product) {
        const itemSubtotal = Number(product.PRICE) * Number(item.QUANTITY);
        subtotal += itemSubtotal;
        totalItems += Number(item.QUANTITY);

        items.push({
          CART_ID: item.CART_ID,
          USER_ID: item.USER_ID,
          PRODUCT_ID: item.PRODUCT_ID,
          QUANTITY: Number(item.QUANTITY),
          ADDED_AT: item.ADDED_AT,
          PRODUCT_NAME: product.PRODUCT_NAME,
          PRICE: Number(product.PRICE),
          IMAGE_URL: product.IMAGE_URL,
          CATEGORY_ID: product.CATEGORY_ID,
          CATEGORY_NAME: product.CATEGORY_NAME,
          STOCK_QUANTITY: product.STOCK_QUANTITY,
          SUBTOTAL: Number(itemSubtotal.toFixed(2))
        });
      }
    }

    return {
      items,
      subtotal: Number(subtotal.toFixed(2)),
      totalItems
    };
  },

  /**
   * Adds an item to the user's cart or increments quantity
   */
  addItem(userId, productId, quantity = 1) {
    const pId = Number(productId);
    const uId = Number(userId);
    const qty = Math.max(1, Number(quantity) || 1);

    const existing = db.table('SHOPPING_CART').findOne(item => item.USER_ID === uId && item.PRODUCT_ID === pId);

    if (existing) {
      const newQty = Number(existing.QUANTITY) + qty;
      db.table('SHOPPING_CART').update(existing.CART_ID, {
        QUANTITY: newQty
      }, 'CART_ID');
    } else {
      db.table('SHOPPING_CART').insert({
        USER_ID: uId,
        PRODUCT_ID: pId,
        QUANTITY: qty,
        ADDED_AT: new Date().toISOString()
      });
    }

    return this.findByUserId(uId);
  },

  /**
   * Updates an item's quantity in the cart
   */
  updateQuantity(userId, { cartId, productId, quantity }) {
    const uId = Number(userId);
    const qty = Number(quantity);

    let target = null;
    if (cartId) {
      target = db.table('SHOPPING_CART').findOne(item => item.USER_ID === uId && item.CART_ID === Number(cartId));
    } else if (productId) {
      target = db.table('SHOPPING_CART').findOne(item => item.USER_ID === uId && item.PRODUCT_ID === Number(productId));
    }

    if (!target) {
      return null;
    }

    if (qty <= 0) {
      db.table('SHOPPING_CART').delete(target.CART_ID, 'CART_ID');
    } else {
      db.table('SHOPPING_CART').update(target.CART_ID, {
        QUANTITY: qty
      }, 'CART_ID');
    }

    return this.findByUserId(uId);
  },

  /**
   * Removes an item from the cart
   */
  removeItem(userId, { cartId, productId }) {
    const uId = Number(userId);

    let target = null;
    if (cartId) {
      target = db.table('SHOPPING_CART').findOne(item => item.USER_ID === uId && item.CART_ID === Number(cartId));
    } else if (productId) {
      target = db.table('SHOPPING_CART').findOne(item => item.USER_ID === uId && item.PRODUCT_ID === Number(productId));
    }

    if (!target) {
      return false;
    }

    db.table('SHOPPING_CART').delete(target.CART_ID, 'CART_ID');
    return true;
  }
};

export default Cart;
