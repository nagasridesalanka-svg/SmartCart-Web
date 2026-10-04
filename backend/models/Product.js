/**
 * SmartCart - Product Model
 * Maps to PRODUCTS(PRODUCT_ID, CATEGORY_ID FK, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
 * and INVENTORY(INVENTORY_ID, PRODUCT_ID FK, STOCK_QUANTITY, LAST_UPDATED)
 */

import db from '../config/db.js';

const Product = {
  /**
   * Retrieves products with optional search query and category filter
   */
  findAll({ search = '', category = null } = {}) {
    return db.getProductsJoined({ search, category });
  },

  /**
   * Retrieves a single product by ID with stock quantity and category name
   */
  findById(id) {
    return db.getProductById(id);
  },

  /**
   * Create a new product (for admin use)
   */
  create({ categoryId, productName, description, price, imageUrl, stockQuantity = 0 }) {
    const product = db.table('PRODUCTS').insert({
      CATEGORY_ID: Number(categoryId),
      PRODUCT_NAME: productName.trim(),
      DESCRIPTION: description.trim(),
      PRICE: Number(price),
      IMAGE_URL: imageUrl.trim(),
      IS_ACTIVE: 1,
      CREATED_AT: new Date().toISOString()
    });

    db.table('INVENTORY').insert({
      PRODUCT_ID: product.PRODUCT_ID,
      STOCK_QUANTITY: Number(stockQuantity),
      LAST_UPDATED: new Date().toISOString()
    });

    return Product.findById(product.PRODUCT_ID);
  }
};

export default Product;
