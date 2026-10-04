/**
 * SmartCart - Express Server
 * Main application entry point. Serves backend REST APIs and frontend static files.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Determine port: command line --port arg, or APP_PORT, or PORT if not 8080 (container internal proxy), default 3000
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const argPort = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : null;
const PORT = argPort || (process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000));

// Path to frontend static assets
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');

// Enable CORS for all origins in development
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log basic requests in development
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', supportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SmartCart Express Server'
  });
});

// Serve static frontend files at both root and /frontend
app.use(express.static(FRONTEND_DIR));
app.use('/frontend', express.static(FRONTEND_DIR));

// Fallback for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Catch-all for HTML pages requested without .html extension
app.get('/:page', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const pageWithHtml = path.join(FRONTEND_DIR, `${req.params.page}.html`);
  const regularFile = path.join(FRONTEND_DIR, req.params.page);

  if (fs.existsSync(pageWithHtml) && fs.statSync(pageWithHtml).isFile()) {
    return res.sendFile(pageWithHtml);
  }
  if (fs.existsSync(regularFile) && fs.statSync(regularFile).isFile()) {
    return res.sendFile(regularFile);
  }
  next();
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Catch-all fallback to index.html for client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start Express server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  SmartCart server is running at http://0.0.0.0:${PORT}`);
  console.log(`  Frontend served from: ${FRONTEND_DIR}`);
  console.log(`  Default Admin: admin@smartcart.com / Admin@123`);
  console.log(`  Default Customer: john.doe@example.com / Customer@123`);
  console.log(`=======================================================`);
});

export default app;
