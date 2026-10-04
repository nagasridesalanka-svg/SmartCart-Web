# SmartCart Database Schema & Relational Design

The database schema strictly adheres to third normal form (3NF) relational design principles. Primary keys uniquely identify entities, and foreign key constraints enforce referential integrity.

---

## Entity Relationship Overview

```
 [USERS] 1 ────< [SHOPPING_CART] >──── 1 [PRODUCTS] 1 ────< [INVENTORY]
    1                                        1
    │                                        │
    ▼                                        ▼
 [ORDERS] 1 ────< [ORDER_DETAILS] >──────────┘
    1
    ├──── 1 [PAYMENTS]
    │
    └────< [SUPPORT_TICKETS] 1 ──── 1 [SUPPORT_FEEDBACK]
```

---

## Table Descriptions

### 1. `USERS`
- **Primary Key**: `USER_ID`
- **Columns**: `USER_ID`, `FULL_NAME`, `EMAIL`, `PASSWORD`, `PHONE`, `ADDRESS`, `ROLE`, `CREATED_AT`
- **Description**: Stores authentication credentials, contact coordinates, and authorization role (`customer`, `admin`). Passwords are encrypted via `bcrypt` with salt rounds.

### 2. `CATEGORIES`
- **Primary Key**: `CATEGORY_ID`
- **Columns**: `CATEGORY_ID`, `CATEGORY_NAME`, `DESCRIPTION`
- **Description**: Organizes items into distinct shopping departments.

### 3. `PRODUCTS`
- **Primary Key**: `PRODUCT_ID`
- **Foreign Key**: `CATEGORY_ID` -> `CATEGORIES.CATEGORY_ID`
- **Columns**: `PRODUCT_ID`, `CATEGORY_ID`, `PRODUCT_NAME`, `DESCRIPTION`, `PRICE`, `IMAGE_URL`, `IS_ACTIVE`, `CREATED_AT`
- **Description**: Catalog item master. Includes active flag for soft deprecation.

### 4. `INVENTORY`
- **Primary Key**: `INVENTORY_ID`
- **Foreign Key**: `PRODUCT_ID` -> `PRODUCTS.PRODUCT_ID`
- **Columns**: `INVENTORY_ID`, `PRODUCT_ID`, `STOCK_QUANTITY`, `LAST_UPDATED`
- **Description**: Tracks real-time warehouse stock level per product.

### 5. `SHOPPING_CART`
- **Primary Key**: `CART_ID`
- **Foreign Keys**: `USER_ID` -> `USERS.USER_ID`, `PRODUCT_ID` -> `PRODUCTS.PRODUCT_ID`
- **Columns**: `CART_ID`, `USER_ID`, `PRODUCT_ID`, `QUANTITY`, `ADDED_AT`
- **Description**: Manages pre-checkout line items selected by customers.

### 6. `ORDERS`
- **Primary Key**: `ORDER_ID`
- **Foreign Key**: `USER_ID` -> `USERS.USER_ID`
- **Columns**: `ORDER_ID`, `USER_ID`, `ORDER_DATE`, `TOTAL_AMOUNT`, `ORDER_STATUS`
- **Description**: Captured customer orders with status progression (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

### 7. `ORDER_DETAILS`
- **Primary Key**: `DETAIL_ID`
- **Foreign Keys**: `ORDER_ID` -> `ORDERS.ORDER_ID`, `PRODUCT_ID` -> `PRODUCTS.PRODUCT_ID`
- **Columns**: `DETAIL_ID`, `ORDER_ID`, `PRODUCT_ID`, `QUANTITY`, `PRICE`
- **Description**: Immutable historical snapshot of items and price at checkout time.

### 8. `PAYMENTS`
- **Primary Key**: `PAYMENT_ID`
- **Foreign Key**: `ORDER_ID` -> `ORDERS.ORDER_ID`
- **Columns**: `PAYMENT_ID`, `ORDER_ID`, `PAYMENT_METHOD`, `PAYMENT_STATUS`, `PAYMENT_DATE`
- **Description**: Financial settlement transaction records.

### 9. `SUPPORT_TICKETS`
- **Primary Key**: `TICKET_ID`
- **Foreign Keys**: `USER_ID` -> `USERS.USER_ID`, `ORDER_ID` -> `ORDERS.ORDER_ID`
- **Columns**: `TICKET_ID`, `USER_ID`, `ORDER_ID`, `ISSUE_TYPE`, `DESCRIPTION`, `STATUS`, `PRIORITY`, `CREATED_AT`
- **Description**: Customer assistance requests and resolution tracking.

### 10. `SUPPORT_FEEDBACK`
- **Primary Key**: `FEEDBACK_ID`
- **Foreign Key**: `TICKET_ID` -> `SUPPORT_TICKETS.TICKET_ID`
- **Columns**: `FEEDBACK_ID`, `TICKET_ID`, `RATING`, `COMMENTS`
- **Description**: Post-ticket CSAT ratings (1 to 5) and commentary.
