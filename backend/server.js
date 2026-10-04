/**
 * SmartCart - Express Server
 * Main application entry point. Serves backend REST APIs and frontend static files.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SmartCart Express Server'
  });
});

// Path to frontend static assets
const FRONTEND_DIR = path.resolve(__dirname, '../frontend');

// Serve static frontend files (HTML, CSS, JS, Images)
app.use(express.static(FRONTEND_DIR));

// Fallback for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Catch-all for other HTML pages if requested without extension
app.get('/:page', (req, res, next) => {
  const pageWithHtml = path.join(FRONTEND_DIR, `${req.params.page}.html`);
  const regularFile = path.join(FRONTEND_DIR, req.params.page);
  
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(pageWithHtml, (err) => {
    if (err) {
      res.sendFile(regularFile, (err2) => {
        if (err2) {
          next();
        }
      });
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Start Express server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  SmartCart server is running at http://localhost:${PORT}`);
  console.log(`  Frontend served from: ${FRONTEND_DIR}`);
  console.log(`  Default Admin: admin@smartcart.com / Admin@123`);
  console.log(`  Default Customer: john.doe@example.com / Customer@123`);
  console.log(`=======================================================`);
});

export default app;
