/**
 * SmartCart - Admin Controller
 * Administrative operations for metrics, product CRUD, category CRUD, inventory management,
 * order supervision & items breakdown, user role management & deletion guards, and support ticket management.
 */

import db from '../config/db.js';
import User from '../models/User.js';

export const adminController = {
  /**
   * GET /api/admin/stats
   * Returns store overview metrics: total users, total orders, total revenue, open tickets
   */
  async getStats(req, res) {
    try {
      const totalUsers = db.rawDb.prepare('SELECT COUNT(*) as count FROM USERS').get().count;
      const totalOrders = db.rawDb.prepare('SELECT COUNT(*) as count FROM ORDERS').get().count;
      
      const revenueRow = db.rawDb.prepare('SELECT SUM(TOTAL_AMOUNT) as revenue FROM ORDERS').get();
      const totalRevenue = revenueRow && revenueRow.revenue ? Number(revenueRow.revenue.toFixed(2)) : 0;

      const openTickets = db.rawDb.prepare("SELECT COUNT(*) as count FROM SUPPORT_TICKETS WHERE STATUS = 'Open'").get().count;
      const totalProducts = db.rawDb.prepare('SELECT COUNT(*) as count FROM PRODUCTS').get().count;

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalOrders,
          totalRevenue,
          openTickets,
          totalProducts
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve administrative statistics.'
      });
    }
  },

  /**
   * GET /api/admin/products
   * Returns all products with category details and current stock
   */
  async getProducts(req, res) {
    try {
      const sql = `
        SELECT p.PRODUCT_ID, p.CATEGORY_ID, p.PRODUCT_NAME, p.DESCRIPTION, p.PRICE,
               p.IMAGE_URL, p.IS_ACTIVE, p.CREATED_AT,
               c.CATEGORY_NAME,
               COALESCE(i.STOCK_QUANTITY, 0) AS STOCK_QUANTITY
        FROM PRODUCTS p
        LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
        LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
        ORDER BY p.PRODUCT_ID DESC
      `;
      const products = db.rawDb.prepare(sql).all();

      return res.status(200).json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Error fetching admin products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve products.'
      });
    }
  },

  /**
   * POST /api/admin/products
   */
  async createProduct(req, res) {
    try {
      const { name, categoryId, description, price, imageUrl, stock = 0 } = req.body;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Product name must be at least 2 characters.' });
      }

      if (!categoryId || !Number(categoryId)) {
        return res.status(400).json({ success: false, message: 'Valid category is required.' });
      }

      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
      }

      const img = imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
      const now = new Date().toISOString();

      const prodStmt = db.rawDb.prepare(`
        INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `);

      const prodRes = prodStmt.run(
        Number(categoryId),
        name.trim(),
        (description || '').trim(),
        Number(price),
        img,
        now
      );

      const productId = Number(prodRes.lastInsertRowid);
      const stockQty = Math.max(0, parseInt(stock, 10) || 0);

      db.rawDb.prepare(`
        INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED)
        VALUES (?, ?, ?)
      `).run(productId, stockQty, now);

      const newProduct = db.getProductById(productId);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product: newProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
  },

  /**
   * PUT /api/admin/products/:id
   */
  async updateProduct(req, res) {
    try {
      const productId = Number(req.params.id);
      const { name, categoryId, description, price, imageUrl, stock, isActive } = req.body;

      const existing = db.rawDb.prepare('SELECT * FROM PRODUCTS WHERE PRODUCT_ID = ?').get(productId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const updatedName = name ? name.trim() : existing.PRODUCT_NAME;
      const updatedCatId = categoryId ? Number(categoryId) : existing.CATEGORY_ID;
      const updatedDesc = description !== undefined ? description.trim() : existing.DESCRIPTION;
      const updatedPrice = price !== undefined ? Number(price) : existing.PRICE;
      const updatedImg = imageUrl ? imageUrl.trim() : existing.IMAGE_URL;
      const updatedActive = isActive !== undefined ? (isActive ? 1 : 0) : existing.IS_ACTIVE;

      db.rawDb.prepare(`
        UPDATE PRODUCTS
        SET PRODUCT_NAME = ?, CATEGORY_ID = ?, DESCRIPTION = ?, PRICE = ?, IMAGE_URL = ?, IS_ACTIVE = ?
        WHERE PRODUCT_ID = ?
      `).run(updatedName, updatedCatId, updatedDesc, updatedPrice, updatedImg, updatedActive, productId);

      if (stock !== undefined && !isNaN(Number(stock))) {
        const stockQty = Math.max(0, parseInt(stock, 10));
        const now = new Date().toISOString();
        const invRow = db.rawDb.prepare('SELECT INVENTORY_ID FROM INVENTORY WHERE PRODUCT_ID = ?').get(productId);
        if (invRow) {
          db.rawDb.prepare('UPDATE INVENTORY SET STOCK_QUANTITY = ?, LAST_UPDATED = ? WHERE PRODUCT_ID = ?').run(stockQty, now, productId);
        } else {
          db.rawDb.prepare('INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (?, ?, ?)').run(productId, stockQty, now);
        }
      }

      const updated = db.getProductById(productId);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product: updated
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
  },

  /**
   * PATCH /api/admin/products/:id/toggle
   */
  async toggleProductStatus(req, res) {
    try {
      const productId = Number(req.params.id);
      const product = db.rawDb.prepare('SELECT PRODUCT_ID, IS_ACTIVE FROM PRODUCTS WHERE PRODUCT_ID = ?').get(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const newStatus = product.IS_ACTIVE === 1 ? 0 : 1;
      db.rawDb.prepare('UPDATE PRODUCTS SET IS_ACTIVE = ? WHERE PRODUCT_ID = ?').run(newStatus, productId);

      return res.status(200).json({
        success: true,
        message: `Product #${productId} is now ${newStatus === 1 ? 'Active' : 'Inactive'}.`,
        isActive: newStatus === 1
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      return res.status(500).json({ success: false, message: 'Failed to toggle product status.' });
    }
  },

  /**
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req, res) {
    try {
      const productId = Number(req.params.id);
      const product = db.rawDb.prepare('SELECT PRODUCT_ID FROM PRODUCTS WHERE PRODUCT_ID = ?').get(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      db.rawDb.prepare('DELETE FROM INVENTORY WHERE PRODUCT_ID = ?').run(productId);
      db.rawDb.prepare('DELETE FROM SHOPPING_CART WHERE PRODUCT_ID = ?').run(productId);
      db.rawDb.prepare('DELETE FROM PRODUCTS WHERE PRODUCT_ID = ?').run(productId);

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
  },

  /**
   * GET /api/admin/categories
   */
  async getCategories(req, res) {
    try {
      const sql = `
        SELECT c.CATEGORY_ID, c.CATEGORY_NAME, c.DESCRIPTION,
               COUNT(p.PRODUCT_ID) AS PRODUCT_COUNT
        FROM CATEGORIES c
        LEFT JOIN PRODUCTS p ON c.CATEGORY_ID = p.CATEGORY_ID
        GROUP BY c.CATEGORY_ID
        ORDER BY c.CATEGORY_ID ASC
      `;
      const categories = db.rawDb.prepare(sql).all();

      return res.status(200).json({
        success: true,
        categories
      });
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
    }
  },

  /**
   * POST /api/admin/categories
   */
  async createCategory(req, res) {
    try {
      const { categoryName, description } = req.body;
      if (!categoryName || categoryName.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters.' });
      }

      const existing = db.rawDb.prepare('SELECT CATEGORY_ID FROM CATEGORIES WHERE LOWER(CATEGORY_NAME) = ?').get(categoryName.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
      }

      const stmt = db.rawDb.prepare('INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) VALUES (?, ?)');
      const result = stmt.run(categoryName.trim(), (description || '').trim());
      const catId = Number(result.lastInsertRowid);
      const newCat = db.rawDb.prepare('SELECT * FROM CATEGORIES WHERE CATEGORY_ID = ?').get(catId);

      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        category: newCat
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
  },

  /**
   * PUT /api/admin/categories/:id
   */
  async updateCategory(req, res) {
    try {
      const catId = Number(req.params.id);
      const { categoryName, description } = req.body;

      const category = db.rawDb.prepare('SELECT * FROM CATEGORIES WHERE CATEGORY_ID = ?').get(catId);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }

      if (!categoryName || categoryName.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters.' });
      }

      db.rawDb.prepare('UPDATE CATEGORIES SET CATEGORY_NAME = ?, DESCRIPTION = ? WHERE CATEGORY_ID = ?')
        .run(categoryName.trim(), (description || '').trim(), catId);

      const updated = db.rawDb.prepare('SELECT * FROM CATEGORIES WHERE CATEGORY_ID = ?').get(catId);

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        category: updated
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
  },

  /**
   * DELETE /api/admin/categories/:id
   */
  async deleteCategory(req, res) {
    try {
      const catId = Number(req.params.id);
      const count = db.rawDb.prepare('SELECT COUNT(*) as count FROM PRODUCTS WHERE CATEGORY_ID = ?').get(catId).count;
      if (count > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category: ${count} product(s) currently belong to it.`
        });
      }

      db.rawDb.prepare('DELETE FROM CATEGORIES WHERE CATEGORY_ID = ?').run(catId);

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete category.' });
    }
  },

  /**
   * GET /api/admin/inventory
   */
  async getInventory(req, res) {
    try {
      const sql = `
        SELECT p.PRODUCT_ID, p.PRODUCT_NAME, p.PRICE, p.IMAGE_URL, p.IS_ACTIVE,
               c.CATEGORY_NAME,
               COALESCE(i.STOCK_QUANTITY, 0) AS STOCK_QUANTITY,
               i.LAST_UPDATED,
               CASE WHEN COALESCE(i.STOCK_QUANTITY, 0) < 5 THEN 1 ELSE 0 END AS IS_LOW_STOCK
        FROM PRODUCTS p
        LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
        LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
        ORDER BY i.STOCK_QUANTITY ASC, p.PRODUCT_ID ASC
      `;
      const inventory = db.rawDb.prepare(sql).all();

      return res.status(200).json({
        success: true,
        inventory
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve inventory.' });
    }
  },

  /**
   * PUT /api/admin/inventory/:productId
   */
  async updateInventory(req, res) {
    try {
      const productId = Number(req.params.productId);
      const { stockQuantity } = req.body;

      if (stockQuantity === undefined || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
        return res.status(400).json({ success: false, message: 'Valid stock quantity (0 or greater) is required.' });
      }

      const qty = parseInt(stockQuantity, 10);
      const now = new Date().toISOString();

      const invRow = db.rawDb.prepare('SELECT INVENTORY_ID FROM INVENTORY WHERE PRODUCT_ID = ?').get(productId);
      if (invRow) {
        db.rawDb.prepare('UPDATE INVENTORY SET STOCK_QUANTITY = ?, LAST_UPDATED = ? WHERE PRODUCT_ID = ?')
          .run(qty, now, productId);
      } else {
        db.rawDb.prepare('INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (?, ?, ?)')
          .run(productId, qty, now);
      }

      return res.status(200).json({
        success: true,
        message: `Inventory for product #${productId} updated to ${qty} units.`,
        stockQuantity: qty,
        isLowStock: qty < 5
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      return res.status(500).json({ success: false, message: 'Failed to update inventory.' });
    }
  },

  /**
   * GET /api/admin/orders
   * Returns all store orders joined with customer and items breakdown
   */
  async getOrders(req, res) {
    try {
      const sql = `
        SELECT o.ORDER_ID, o.USER_ID, o.ORDER_DATE, o.TOTAL_AMOUNT, o.ORDER_STATUS, o.SHIPPING_ADDRESS,
               u.FULL_NAME, u.EMAIL,
               p.PAYMENT_METHOD, p.PAYMENT_STATUS
        FROM ORDERS o
        LEFT JOIN USERS u ON o.USER_ID = u.USER_ID
        LEFT JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
        ORDER BY o.ORDER_ID DESC
      `;
      const orders = db.rawDb.prepare(sql).all();

      // Fetch items for each order
      const itemsStmt = db.rawDb.prepare(`
        SELECT d.DETAIL_ID, d.ORDER_ID, d.PRODUCT_ID, d.QUANTITY, d.PRICE,
               p.PRODUCT_NAME, p.IMAGE_URL, c.CATEGORY_NAME
        FROM ORDER_DETAILS d
        LEFT JOIN PRODUCTS p ON d.PRODUCT_ID = p.PRODUCT_ID
        LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
        WHERE d.ORDER_ID = ?
      `);

      const ordersWithItems = orders.map(o => {
        const items = itemsStmt.all(o.ORDER_ID);
        return {
          ...o,
          items,
          itemCount: items.reduce((sum, item) => sum + item.QUANTITY, 0)
        };
      });

      return res.status(200).json({
        success: true,
        orders: ordersWithItems
      });
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
    }
  },

  /**
   * GET /api/admin/orders/:id
   * Returns single order details and items
   */
  async getOrderById(req, res) {
    try {
      const orderId = Number(req.params.id);
      const order = db.rawDb.prepare(`
        SELECT o.ORDER_ID, o.USER_ID, o.ORDER_DATE, o.TOTAL_AMOUNT, o.ORDER_STATUS, o.SHIPPING_ADDRESS,
               u.FULL_NAME, u.EMAIL, u.PHONE,
               p.PAYMENT_METHOD, p.PAYMENT_STATUS
        FROM ORDERS o
        LEFT JOIN USERS u ON o.USER_ID = u.USER_ID
        LEFT JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
        WHERE o.ORDER_ID = ?
      `).get(orderId);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const items = db.rawDb.prepare(`
        SELECT d.DETAIL_ID, d.ORDER_ID, d.PRODUCT_ID, d.QUANTITY, d.PRICE,
               p.PRODUCT_NAME, p.IMAGE_URL, c.CATEGORY_NAME
        FROM ORDER_DETAILS d
        LEFT JOIN PRODUCTS p ON d.PRODUCT_ID = p.PRODUCT_ID
        LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
        WHERE d.ORDER_ID = ?
      `).all(orderId);

      return res.status(200).json({
        success: true,
        order: {
          ...order,
          items
        }
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
    }
  },

  /**
   * PUT /api/admin/orders/:id/status
   * Updates an order status (Placed, Shipped, Delivered, Cancelled)
   */
  async updateOrderStatus(req, res) {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;
      const valid = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

      if (!status || !valid.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
      }

      db.rawDb.prepare('UPDATE ORDERS SET ORDER_STATUS = ? WHERE ORDER_ID = ?').run(status, orderId);

      return res.status(200).json({
        success: true,
        message: `Order #${orderId} status changed to ${status}.`,
        orderStatus: status
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
  },

  /**
   * GET /api/admin/users
   * Returns list of all registered users (name, email, phone, role, joined date)
   */
  async getUsers(req, res) {
    try {
      const users = db.rawDb.prepare(`
        SELECT USER_ID, FULL_NAME, EMAIL, PHONE, ADDRESS, ROLE, CREATED_AT
        FROM USERS
        ORDER BY USER_ID DESC
      `).all();

      return res.status(200).json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  },

  /**
   * PUT /api/admin/users/:id/role
   * Changes a user's role (customer or admin)
   */
  async updateUserRole(req, res) {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      if (!role || !['customer', 'admin'].includes(role.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Role must be either "customer" or "admin".' });
      }

      const user = db.rawDb.prepare('SELECT USER_ID, EMAIL FROM USERS WHERE USER_ID = ?').get(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const newRole = role.toLowerCase();
      db.rawDb.prepare('UPDATE USERS SET ROLE = ? WHERE USER_ID = ?').run(newRole, userId);

      return res.status(200).json({
        success: true,
        message: `User ${user.EMAIL} role updated to ${newRole}.`,
        role: newRole
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({ success: false, message: 'Failed to update user role.' });
    }
  },

  /**
   * DELETE /api/admin/users/:id
   * Deletes a user. Enforces guard: "An admin cannot delete themselves."
   */
  async deleteUser(req, res) {
    try {
      const targetUserId = Number(req.params.id);

      // Check self-deletion guard
      if (req.user.USER_ID === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'An admin cannot delete their own account.'
        });
      }

      const target = db.rawDb.prepare('SELECT USER_ID, EMAIL FROM USERS WHERE USER_ID = ?').get(targetUserId);
      if (!target) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Clean up relations
      db.rawDb.prepare('DELETE FROM SHOPPING_CART WHERE USER_ID = ?').run(targetUserId);
      db.rawDb.prepare('DELETE FROM SUPPORT_FEEDBACK WHERE TICKET_ID IN (SELECT TICKET_ID FROM SUPPORT_TICKETS WHERE USER_ID = ?)').run(targetUserId);
      db.rawDb.prepare('DELETE FROM SUPPORT_TICKETS WHERE USER_ID = ?').run(targetUserId);
      db.rawDb.prepare('DELETE FROM USERS WHERE USER_ID = ?').run(targetUserId);

      return res.status(200).json({
        success: true,
        message: `User ${target.EMAIL} was deleted successfully.`
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
  },

  /**
   * GET /api/admin/tickets
   * Returns all support tickets with customer info, order reference, and feedback rating
   */
  async getTickets(req, res) {
    try {
      const sql = `
        SELECT t.TICKET_ID, t.USER_ID, t.ORDER_ID, t.ISSUE_TYPE, t.DESCRIPTION,
               t.STATUS, t.PRIORITY, t.CREATED_AT,
               u.FULL_NAME, u.EMAIL,
               f.FEEDBACK_ID, f.RATING, f.COMMENTS as FEEDBACK_COMMENTS
        FROM SUPPORT_TICKETS t
        LEFT JOIN USERS u ON t.USER_ID = u.USER_ID
        LEFT JOIN SUPPORT_FEEDBACK f ON t.TICKET_ID = f.TICKET_ID
        ORDER BY t.TICKET_ID DESC
      `;
      const tickets = db.rawDb.prepare(sql).all();

      const formatted = tickets.map(t => ({
        ...t,
        hasFeedback: !!t.FEEDBACK_ID,
        FEEDBACK: t.FEEDBACK_ID ? {
          FEEDBACK_ID: t.FEEDBACK_ID,
          RATING: t.RATING,
          COMMENTS: t.FEEDBACK_COMMENTS
        } : null
      }));

      return res.status(200).json({
        success: true,
        tickets: formatted
      });
    } catch (error) {
      console.error('Error fetching admin tickets:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve support tickets.' });
    }
  },

  /**
   * GET /api/admin/db/tables
   * Returns metadata and row counts for all 10 allowed tables
   */
  async getDatabaseTables(req, res) {
    try {
      const allowedTables = [
        'USERS', 'CATEGORIES', 'PRODUCTS', 'INVENTORY', 'SHOPPING_CART',
        'ORDERS', 'ORDER_DETAILS', 'PAYMENTS', 'SUPPORT_TICKETS', 'SUPPORT_FEEDBACK'
      ];

      const tables = allowedTables.map(table => {
        const count = db.rawDb.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
        return {
          name: table,
          rowCount: count
        };
      });

      return res.status(200).json({
        success: true,
        tables
      });
    } catch (error) {
      console.error('Error fetching database tables:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve database tables.' });
    }
  },

  /**
   * GET /api/admin/db/table/:name
   * Returns all rows for a whitelisted table. The PASSWORD column in USERS shows stored bcrypt hash.
   */
  async getTableData(req, res) {
    try {
      const allowedTables = [
        'USERS', 'CATEGORIES', 'PRODUCTS', 'INVENTORY', 'SHOPPING_CART',
        'ORDERS', 'ORDER_DETAILS', 'PAYMENTS', 'SUPPORT_TICKETS', 'SUPPORT_FEEDBACK'
      ];

      const requestedTable = (req.params.name || '').trim().toUpperCase();

      if (!allowedTables.includes(requestedTable)) {
        return res.status(400).json({
          success: false,
          message: `Invalid or disallowed table name. Allowed tables: ${allowedTables.join(', ')}`
        });
      }

      const rows = db.rawDb.prepare(`SELECT * FROM ${requestedTable}`).all();
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return res.status(200).json({
        success: true,
        table: requestedTable,
        rowCount: rows.length,
        columns,
        rows
      });
    } catch (error) {
      console.error('Error fetching table data:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve table data.' });
    }
  },

  /**
   * POST /api/admin/db/query
   * Executes a custom SELECT query. Strictly rejects anything else.
   */
  async executeReadOnlyQuery(req, res) {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({
          success: false,
          message: 'SQL query string is required.'
        });
      }

      const rawQuery = query.trim();
      // Remove trailing semicolons and whitespace
      const cleanQuery = rawQuery.replace(/;+\s*$/, '').trim();

      // Check for multiple statements (semicolon inside the query)
      if (cleanQuery.includes(';')) {
        return res.status(400).json({
          success: false,
          message: 'Multiple statements are not permitted in queries.'
        });
      }

      // Must be SELECT statement only
      if (!/^\s*SELECT\b/i.test(cleanQuery)) {
        return res.status(400).json({
          success: false,
          message: 'Only SELECT statements are allowed. Modifying queries (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, etc.) are strictly prohibited.'
        });
      }

      // Check for modifying and DDL keywords anywhere
      const forbiddenKeywords = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX)\b/i;
      if (forbiddenKeywords.test(cleanQuery)) {
        return res.status(400).json({
          success: false,
          message: 'Query contains forbidden modifying or DDL keywords. Only read-only SELECT queries are allowed.'
        });
      }

      const startTime = Date.now();
      const rows = db.rawDb.prepare(cleanQuery).all();
      const executionTimeMs = Date.now() - startTime;
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return res.status(200).json({
        success: true,
        query: cleanQuery,
        rowCount: rows.length,
        columns,
        rows,
        executionTimeMs
      });
    } catch (error) {
      console.error('SQL query execution error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Error executing SQL query.'
      });
    }
  }
};

export default adminController;
