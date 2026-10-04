/**
 * SmartCart - Admin Routes
 * Protected endpoints exclusively accessible by administrators.
 */

import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import supportController from '../controllers/supportController.js';
import authenticate from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

// Apply authentication and admin-only role guard to all routes
router.use(authenticate, requireAdmin);

// Overview Stats
router.get('/stats', adminController.getStats);

// Products Management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.patch('/products/:id/toggle', adminController.toggleProductStatus);
router.delete('/products/:id', adminController.deleteProduct);

// Categories Management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Inventory Management
router.get('/inventory', adminController.getInventory);
router.put('/inventory/:productId', adminController.updateInventory);

// Orders Supervision & Items Breakdown
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Users Directory & Role / Deletion Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Support Tickets Supervision
router.get('/tickets', adminController.getTickets);
router.put('/tickets/status', supportController.updateTicketStatus);

// Database Viewer & SQL Execution
router.get('/db/tables', adminController.getDatabaseTables);
router.get('/db/table/:name', adminController.getTableData);
router.post('/db/query', adminController.executeReadOnlyQuery);

export default router;
