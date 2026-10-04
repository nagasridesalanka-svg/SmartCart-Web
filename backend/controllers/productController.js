/**
 * SmartCart - Product & Category Controller
 * Handles product querying, category filtering, search, and individual product details.
 */

import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const productController = {
  /**
   * GET /api/categories
   * Retrieves all product categories
   */
  async getCategories(req, res) {
    try {
      const categories = Category.findAll();
      return res.status(200).json({
        success: true,
        categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories.'
      });
    }
  },

  /**
   * GET /api/products
   * Supports ?search= and ?category=
   */
  async getProducts(req, res) {
    try {
      const { search, category } = req.query;

      const products = Product.findAll({
        search: typeof search === 'string' ? search : '',
        category: category ? Number(category) : null
      });

      return res.status(200).json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve products.'
      });
    }
  },

  /**
   * GET /api/products/:id
   * Retrieves a single product with stock quantity and category name
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} was not found.`
        });
      }

      return res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve product details.'
      });
    }
  }
};

export default productController;
