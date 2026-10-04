# SmartCart — Minimal & Professional E-Commerce Platform

SmartCart is a minimal, clean, and beginner-friendly e-commerce platform built strictly with **plain HTML5, CSS3, vanilla JavaScript**, and a **Node.js + Express** backend.

---

## Key Highlights & Architectural Standards
- **No Heavy Frameworks**: No React, no Vue, no Tailwind CSS runtime on the client. Pure semantic HTML5, shared CSS3 with custom properties, and modular vanilla JavaScript.
- **Relational SQL Architecture**: Strictly structured tables with primary keys, foreign keys, timestamps, and indexes. Full scripts in Oracle SQL syntax in `/database`.
- **Persistent Data Store**: Data persists reliably in `backend/data/` across server restarts.
- **JWT & Role-Based Access Control**: Secure bcrypt password hashing, JSON Web Tokens stored in browser `localStorage`, and custom Express authentication/admin-only middleware.
- **Minimalist Design System**: Carefully crafted Inter font typography, 8px spacing scale, 1200px container, subtle elevation, responsive sticky header, inline SVG icons, inline field validation, and responsive mobile navigation.

---

## Quickstart

### 1. Start the Server
```bash
npm run dev
```
Express starts on port `3000`. Navigate to `http://localhost:3000`.

### 2. Default Seed Accounts
| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartcart.com` | `Admin@123` | Administrator |
| **Customer** | `john.doe@example.com` | `Customer@123` | Customer |

---

## Directory Structure
```
SmartCart/
├── frontend/             # Static web assets served by Express
│   ├── index.html        # Home storefront (hero, categories, featured)
│   ├── login.html        # Clean login with inline validation
│   ├── register.html     # User registration form with validation
│   ├── products.html     # Catalog with search, category filtering & sorting
│   ├── product-details.html # High-res product showcase & stock status
│   ├── cart.html         # Cart view (with sticky navbar)
│   ├── checkout.html     # Checkout view (with sticky navbar)
│   ├── orders.html       # Customer orders (with sticky navbar)
│   ├── profile.html      # Account profile (with sticky navbar)
│   ├── support.html      # Support portal (with sticky navbar)
│   ├── admin.html        # Admin portal (with sticky navbar)
│   ├── css/
│   │   └── style.css     # Unified minimal design system
│   └── js/
│       ├── api.js        # Reusable API fetch client with error handling
│       ├── auth.js       # Auth manager, user menu dropdown, validation
│       ├── products.js   # Catalog query, rendering, and details page logic
│       ├── cart.js       # Local cart manager & cart count badge
│       ├── orders.js     # Orders placeholder logic
│       ├── support.js    # Support placeholder logic
│       └── admin.js      # Admin placeholder logic
├── backend/              # Node.js + Express backend
│   ├── server.js         # Main Express entry point
│   ├── config/           # Database setup & JWT configuration
│   ├── controllers/      # authController, productController
│   ├── middleware/       # JWT auth & admin-only verification
│   ├── models/           # Relational model adapters
│   ├── routes/           # Express API routes
│   └── data/             # Persistent database storage
├── database/             # Oracle SQL scripts (tables, seed data, views, joins, aggregates)
├── documentation/        # Setup guide, API docs, schema explanations
└── README.md
```

---

## Implemented API Endpoints
- `POST /api/register` — Register a new customer
- `POST /api/login` — Authenticate and receive a JWT
- `GET /api/me` — Verify token and get profile
- `GET /api/categories` — List all product categories
- `GET /api/products` — Filter products by `search` and `category`
- `GET /api/products/:id` — Retrieve single product details with stock status
