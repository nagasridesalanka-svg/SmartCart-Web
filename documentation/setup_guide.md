# SmartCart Setup Guide

This guide walks you through setting up and running **SmartCart**, a clean, beginner-friendly e-commerce web application powered by HTML5, CSS3, vanilla JavaScript, Node.js, and Express.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## 2. Directory Layout
```
SmartCart/
├── frontend/             # Static web assets served by Express
│   ├── index.html        # Home storefront with hero, categories, and featured products
│   ├── products.html     # Product catalog with search and category filtering
│   ├── product-details.html # Detailed product view with stock status and cart action
│   ├── login.html        # User login with validation and JWT storage
│   ├── register.html     # User registration with field validation
│   ├── cart.html         # Cart view (placeholder with shared navbar)
│   ├── checkout.html     # Checkout view (placeholder with shared navbar)
│   ├── orders.html       # Order history (placeholder with shared navbar)
│   ├── profile.html      # User account (placeholder with shared navbar)
│   ├── support.html      # Customer service (placeholder with shared navbar)
│   ├── admin.html        # Administration portal (placeholder with shared navbar)
│   ├── css/
│   │   └── style.css     # Unified minimal design system
│   └── js/
│       ├── api.js        # Reusable API fetch client with error handling
│       ├── auth.js       # Authentication state, navbar user dropdown, login/register
│       ├── products.js   # Catalog query, rendering, and details page logic
│       ├── cart.js       # Cart badge & local cart manager
│       ├── orders.js     # Orders placeholder logic
│       ├── support.js    # Support placeholder logic
│       └── admin.js      # Admin placeholder logic
├── backend/              # Node.js + Express backend
│   ├── server.js         # Main Express entry point
│   ├── config/           # Database setup & JWT configuration
│   ├── controllers/      # Route controllers (authController, productController)
│   ├── middleware/       # JWT auth & admin-only verification
│   ├── models/           # Relational model adapters
│   ├── routes/           # Express API routes
│   └── data/             # Persistent database storage (smartcart.db / smartcart_db.json)
├── database/             # Oracle SQL scripts (tables, seed data, views, joins, aggregates)
├── documentation/        # Architectural guides and API documentation
└── README.md             # Overview and quickstart
```

---

## 3. Starting the Server
To launch the application:
```bash
npm run dev
```
The Express server starts listening on port `3000` (or `process.env.PORT`).
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 4. Default Seed Accounts
Upon initial startup, the database automatically initializes with 5 categories, 16 products with inventory, and two pre-configured user accounts:

| Role | Email | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smartcart.com` | `Admin@123` | System Administrator |
| **Customer** | `john.doe@example.com` | `Customer@123` | John Doe |

---

## 5. Environment Configuration
Default configurations run seamlessly out of the box with zero external dependencies. Optional environment variables:
- `PORT`: Port number (default `3000`)
- `JWT_SECRET`: Secret key used for signing JWT authentication tokens
