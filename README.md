# SmartCart — E-Commerce Web Platform

SmartCart is a responsive e-commerce web platform engineered with **semantic HTML5**, a **custom CSS3 design system**, **vanilla JavaScript (ES6+ Modules)**, and a **Node.js + Express** REST API backend. The system features persistent relational storage, role-based access control, customer helpdesk ticketing with feedback, an admin operations suite, and an interactive database viewer.

---

## 1. Tech Stack

- **Frontend**: Plain Semantic HTML5, Vanilla JavaScript (ES6+ modular controllers), CSS3 Design System with CSS variables and responsive breakpoints. No heavy runtime frameworks or component library overhead.
- **Backend**: Node.js & Express RESTful API server.
- **Data Persistence**:
  - Runtime Database: Embedded SQLite (`better-sqlite3`) with WAL (Write-Ahead Logging) mode and foreign keys enabled.
  - Relational Schemas: Standard Oracle SQL / ANSI SQL scripts in `/database/`.
- **Security & Authentication**:
  - Passwords hashed using `bcrypt` (10 salt rounds).
  - Stateless JSON Web Tokens (JWT) stored client-side in `localStorage`.
  - Role-based middleware (`authenticate`, `requireAdmin`) protecting sensitive operations.
  - Read-only SQL executor preventing destructive DDL/DML statements.

---

## 2. Project Directory Structure

```
SmartCart/
├── frontend/                     # Client application served by Express
│   ├── index.html                # Home storefront (hero banner, featured items, departments)
│   ├── products.html             # Product catalog with search, category filtering & sort
│   ├── product-details.html      # Product showcase, live stock indicator, cart actions
│   ├── cart.html                 # Shopping cart manager & order summary
│   ├── checkout.html             # Multi-step checkout with payment simulation
│   ├── orders.html               # Customer order history, timeline milestones, line details
│   ├── profile.html              # Account management, 10-digit phone validation, spend metrics
│   ├── support.html              # 4-tab helpdesk (Create Ticket, Track, FAQ, Feedback)
│   ├── admin.html                # 8-screen admin operations console & database viewer
│   ├── login.html                # User sign-in with redirect capability
│   ├── register.html             # Customer registration with real-time validation
│   ├── css/
│   │   └── style.css             # Unified CSS3 design system & utility classes
│   └── js/
│       ├── api.js                # Fetch wrapper, AuthStorage token management, toast alerts
│       ├── auth.js               # User dropdown menu and auth state synchronizer
│       ├── cart.js               # Client cart persistence & cart counter badge
│       ├── products.js           # Catalog filtering, search, and details controller
│       ├── orders.js             # Customer orders controller
│       ├── support.js            # Helpdesk ticket creation, progress, FAQ, and star ratings
│       └── admin.js              # Complete admin controller (7 management screens + DB viewer)
├── backend/                      # Node.js + Express backend service
│   ├── server.js                 # Server entry point & route mounting
│   ├── config/
│   │   └── db.js                 # SQLite database initialization, schema migration & seed data
│   ├── controllers/
│   │   ├── authController.js     # User registration, authentication, and profile updates
│   │   ├── productController.js  # Catalog queries, search, category retrieval
│   │   ├── cartController.js     # Shopping cart CRUD operations
│   │   ├── orderController.js    # Order placement, checkout, and customer history
│   │   ├── supportController.js  # Ticket creation, priority auto-assignment, feedback
│   │   └── adminController.js    # Store metrics, product/category/inventory/user/DB admin APIs
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer verification middleware
│   │   └── admin.js              # Administrator role verification middleware
│   ├── models/                   # Relational model abstractions
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication & profile routes
│   │   ├── productRoutes.js      # Public product and category routes
│   │   ├── cartRoutes.js         # User cart management routes
│   │   ├── orderRoutes.js        # Order creation and retrieval routes
│   │   ├── supportRoutes.js      # Helpdesk ticket & feedback routes
│   │   └── adminRoutes.js        # Admin management & database viewer routes
│   └── data/
│       └── smartcart.db          # Persistent SQLite database file
├── database/                     # Oracle SQL scripts
│   ├── create_tables.sql         # 10 tables DDL with constraints and ALTER/DROP/TRUNCATE examples
│   ├── insert_data.sql           # Seed data for categories, products, inventory, users, orders
│   ├── views.sql                 # Database views (order summary, low stock, open tickets, category sales)
│   ├── joins.sql                 # INNER JOIN, LEFT JOIN, and RIGHT JOIN demonstration queries
│   └── aggregate_queries.sql     # COUNT, SUM, AVG, MAX, MIN with GROUP BY, HAVING, and ORDER BY
└── package.json                  # Dependencies, scripts, and build configuration
```

---

## 3. How to Run Locally

### Prerequisites
- Node.js (version 18.x or later)
- npm (version 9.x or later)

### Installation & Launch
```bash
# 1. Clone repository and navigate to project root
cd SmartCart

# 2. Install all dependencies
npm install

# 3. Start the application
npm start
```

The Express application will start on port `3000`. Open your browser and navigate to:
```
http://localhost:3000
```

To run in development mode with hot reloading:
```bash
npm run dev
```

---

## 4. Demo Login Credentials

The database comes pre-seeded with administrator and customer test accounts:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smartcart.com` | `Admin@123` | Full access to Admin Console, inventory control, user management, order fulfillment, and Database Viewer |
| **Customer 1** | `john.doe@example.com` | `Customer@123` | Store shopping, checkout, order tracking, profile management, and ticket feedback |
| **Customer 2** | `jane.smith@example.com` | `Customer@123` | Secondary customer with active order history |

---

## 5. API Reference

All requests and responses use JSON format. Protected endpoints require a valid JWT passed in the HTTP Authorization header: `Authorization: Bearer <token>`.

### Authentication & Profile (`/api`)
- `POST /api/register` — Create a new customer account
- `POST /api/login` — Authenticate credentials and receive JWT
- `GET /api/me` — Retrieve authenticated user profile
- `GET /api/profile` — Get account profile details and order statistics
- `PUT /api/profile` — Update full name, 10-digit phone number, and default delivery address

### Catalog & Products (`/api`)
- `GET /api/categories` — List all product categories with metadata
- `GET /api/products` — Filter products by `category`, `search`, and `sort`
- `GET /api/products/:id` — Retrieve detailed single product information and stock balance

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Get current user's active shopping cart items
- `POST /api/cart` — Add a product to cart or increment quantity
- `PUT /api/cart/:productId` — Update item quantity in cart
- `DELETE /api/cart/:productId` — Remove specific item from cart
- `DELETE /api/cart` — Clear all items in cart

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` — Place order, record payment method, decrement stock inventory
- `GET /api/orders` — Retrieve customer order history
- `GET /api/orders/:id` — Get specific order details, line items, and tracking status

### Support Helpdesk & Feedback (`/api`)
- `POST /api/tickets` — Submit support inquiry (auto-assigns High, Medium, or Low priority)
- `GET /api/tickets` — List customer tickets (or all tickets for admin)
- `PUT /api/tickets/status` — *(Admin Only)* Update ticket status (`Open`, `In Progress`, `Resolved`, `Closed`)
- `POST /api/feedback` — Submit 1-5 star rating and comment on a `Resolved` ticket (once per ticket)

### Admin Operations Suite (`/api/admin/...` — Admin Only)
- `GET /api/admin/stats` — Store overview metrics (users, orders, total revenue, open tickets)
- `GET /api/admin/products` — List all catalog products including inactive items
- `POST /api/admin/products` — Create new product with initial inventory
- `PUT /api/admin/products/:id` — Update product details and stock level
- `PATCH /api/admin/products/:id/toggle` — Toggle product storefront active/inactive visibility
- `DELETE /api/admin/products/:id` — Permanently delete product and associated inventory
- `GET /api/admin/categories` — List categories with assigned product count
- `POST /api/admin/categories` — Add new product category
- `PUT /api/admin/categories/:id` — Edit category name and description
- `DELETE /api/admin/categories/:id` — Delete category (prevented if products are assigned)
- `GET /api/admin/inventory` — Product inventory table with `< 5` low stock highlights
- `PUT /api/admin/inventory/:productId` — Adjust on-hand unit balance
- `GET /api/admin/orders` — Complete store orders list with line item details
- `GET /api/admin/orders/:id` — Retrieve single order line items breakdown
- `PUT /api/admin/orders/:id/status` — Transition order fulfillment state (`Placed`, `Shipped`, `Delivered`, `Cancelled`)
- `GET /api/admin/users` — Directory of registered accounts
- `PUT /api/admin/users/:id/role` — Update user role (`customer` or `admin`)
- `DELETE /api/admin/users/:id` — Delete user account (with admin self-deletion guard)
- `GET /api/admin/tickets` — Overview of all customer support inquiries

### Database Viewer APIs (`/api/admin/db/...` — Admin Only)
- `GET /api/admin/db/tables` — Returns metadata and row counts for all 10 schema tables
- `GET /api/admin/db/table/:name` — Whitelisted table browser displaying all rows and stored bcrypt hashes
- `POST /api/admin/db/query` — Read-only SQL query executor (strictly enforces SELECT statements, blocks DDL/DML)

---

## 6. Database Tables & Entity Relationships

The relational schema is composed of **10 normalized tables** maintaining referential integrity across the e-commerce lifecycle:

```
                      +---------------+
                      |  CATEGORIES   |
                      +---------------+
                             | 1
                             |
                             | N
+---------------+ 1   N +---------------+ 1   1 +---------------+
|     USERS     |-------|   PRODUCTS    |-------|   INVENTORY   |
+---------------+       +---------------+       +---------------+
   | 1       | 1             | 1
   |         |               |
   | N       | N             | N
   |   +---------------+     |
   |   | SHOPPING_CART |-----+
   |   +---------------+
   |
   | 1
   +--------------------+
   |                    |
   | N                  | N
+---------------+    +-------------------+ 1   1 +-------------------+
|    ORDERS     |    |  SUPPORT_TICKETS  |-------| SUPPORT_FEEDBACK  |
+---------------+    +-------------------+       +-------------------+
   | 1       | 1        | N
   |         +----------+ (Optional Order Reference)
   | N       | 1
+---------------+  +---------------+
| ORDER_DETAILS |  |   PAYMENTS    |
+---------------+  +---------------+
```

### Table Schema Summary

1. **`USERS`**: Customer and administrator profiles (`USER_ID`, `FULL_NAME`, `EMAIL`, `PASSWORD`, `PHONE`, `ADDRESS`, `ROLE`, `CREATED_AT`).
2. **`CATEGORIES`**: Product catalog groupings (`CATEGORY_ID`, `CATEGORY_NAME`, `DESCRIPTION`).
3. **`PRODUCTS`**: Store items and catalog records (`PRODUCT_ID`, `CATEGORY_ID`, `PRODUCT_NAME`, `DESCRIPTION`, `PRICE`, `IMAGE_URL`, `IS_ACTIVE`, `CREATED_AT`).
4. **`INVENTORY`**: Stock availability tracking (`INVENTORY_ID`, `PRODUCT_ID`, `STOCK_QUANTITY`, `LAST_UPDATED`).
5. **`SHOPPING_CART`**: Persistent customer carts (`CART_ID`, `USER_ID`, `PRODUCT_ID`, `QUANTITY`, `ADDED_AT`).
6. **`ORDERS`**: Placed customer purchases (`ORDER_ID`, `USER_ID`, `ORDER_DATE`, `TOTAL_AMOUNT`, `ORDER_STATUS`, `SHIPPING_ADDRESS`).
7. **`ORDER_DETAILS`**: Line items for each order (`DETAIL_ID`, `ORDER_ID`, `PRODUCT_ID`, `QUANTITY`, `PRICE`).
8. **`PAYMENTS`**: Transaction records (`PAYMENT_ID`, `ORDER_ID`, `PAYMENT_METHOD`, `PAYMENT_STATUS`, `PAYMENT_DATE`).
9. **`SUPPORT_TICKETS`**: Customer inquiries with auto-assigned priority (`TICKET_ID`, `USER_ID`, `ORDER_ID`, `ISSUE_TYPE`, `DESCRIPTION`, `STATUS`, `PRIORITY`, `CREATED_AT`).
10. **`SUPPORT_FEEDBACK`**: Customer satisfaction reviews on resolved tickets (`FEEDBACK_ID`, `TICKET_ID`, `RATING`, `COMMENTS`).

---

## 7. Oracle SQL Scripts Guide (`/database`)

- `create_tables.sql`: Complete DDL creating all 10 tables with primary keys, foreign keys, check constraints, default values, sequence identities, and commented DDL syntax examples (`ALTER TABLE`, `DROP TABLE`, `TRUNCATE TABLE`).
- `insert_data.sql`: Seed data inserting 5 categories, 16 products with inventory, 3 users, sample orders, payments, tickets, and feedback.
- `views.sql`: Predefined views for `VIEW_ORDER_SUMMARY`, `VIEW_LOW_STOCK_PRODUCTS`, `VIEW_OPEN_TICKETS`, and `VIEW_CATEGORY_SALES_SUMMARY`.
- `joins.sql`: Demonstrations of `INNER JOIN`, `LEFT JOIN`, and `RIGHT JOIN` operations across Users & Orders, Orders & Payments, Products & Categories, and Users & Support Tickets.
- `aggregate_queries.sql`: Analytical aggregations utilizing `COUNT`, `SUM`, `AVG`, `MAX`, `MIN` combined with `GROUP BY`, `HAVING`, and `ORDER BY`.
