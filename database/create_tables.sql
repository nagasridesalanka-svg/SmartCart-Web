-- =====================================================================
-- SmartCart E-Commerce Platform
-- Database Definition: Tables Creation Script
-- Target Database: Oracle SQL / Oracle Database 19c/21c/23c
-- Syntax Standard: Standard Oracle SQL DDL
-- =====================================================================

-- ---------------------------------------------------------------------
-- Drop existing tables in reverse dependency order to avoid FK errors
-- ---------------------------------------------------------------------
BEGIN
    FOR t IN (
        SELECT table_name FROM user_tables 
        WHERE table_name IN (
            'SUPPORT_FEEDBACK', 'SUPPORT_TICKETS', 'PAYMENTS', 
            'ORDER_DETAILS', 'ORDERS', 'SHOPPING_CART', 
            'INVENTORY', 'PRODUCTS', 'CATEGORIES', 'USERS'
        )
    ) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- ---------------------------------------------------------------------
-- 1. USERS Table
-- Stores registered customers and administrative store managers
-- ---------------------------------------------------------------------
CREATE TABLE USERS (
    USER_ID       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FULL_NAME     VARCHAR2(120) NOT NULL,
    EMAIL         VARCHAR2(150) NOT NULL,
    PASSWORD      VARCHAR2(255) NOT NULL,
    PHONE         VARCHAR2(30),
    ADDRESS       VARCHAR2(300),
    ROLE          VARCHAR2(20) DEFAULT 'customer' NOT NULL,
    CREATED_AT    DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT UQ_USERS_EMAIL UNIQUE (EMAIL),
    CONSTRAINT CHK_USERS_ROLE CHECK (ROLE IN ('customer', 'admin', 'manager')),
    CONSTRAINT CHK_USERS_NAME_LEN CHECK (LENGTH(TRIM(FULL_NAME)) >= 2)
);

-- ---------------------------------------------------------------------
-- 2. CATEGORIES Table
-- Product catalog departments and collections
-- ---------------------------------------------------------------------
CREATE TABLE CATEGORIES (
    CATEGORY_ID   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CATEGORY_NAME VARCHAR2(100) NOT NULL,
    DESCRIPTION   VARCHAR2(500),
    CONSTRAINT UQ_CATEGORIES_NAME UNIQUE (CATEGORY_NAME)
);

-- ---------------------------------------------------------------------
-- 3. PRODUCTS Table
-- Store items with pricing, category reference, and active status
-- ---------------------------------------------------------------------
CREATE TABLE PRODUCTS (
    PRODUCT_ID    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CATEGORY_ID   NUMBER NOT NULL,
    PRODUCT_NAME  VARCHAR2(200) NOT NULL,
    DESCRIPTION   VARCHAR2(1000),
    PRICE         NUMBER(10, 2) NOT NULL,
    IMAGE_URL     VARCHAR2(500) NOT NULL,
    IS_ACTIVE     NUMBER(1) DEFAULT 1 NOT NULL,
    CREATED_AT    DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT FK_PRODUCTS_CATEGORY FOREIGN KEY (CATEGORY_ID) 
        REFERENCES CATEGORIES(CATEGORY_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_PRODUCTS_PRICE CHECK (PRICE >= 0),
    CONSTRAINT CHK_PRODUCTS_ACTIVE CHECK (IS_ACTIVE IN (0, 1))
);

-- ---------------------------------------------------------------------
-- 4. INVENTORY Table
-- Tracks on-hand stock quantities per product
-- ---------------------------------------------------------------------
CREATE TABLE INVENTORY (
    INVENTORY_ID   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PRODUCT_ID     NUMBER NOT NULL,
    STOCK_QUANTITY NUMBER DEFAULT 0 NOT NULL,
    LAST_UPDATED   DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT UQ_INVENTORY_PRODUCT UNIQUE (PRODUCT_ID),
    CONSTRAINT FK_INVENTORY_PRODUCT FOREIGN KEY (PRODUCT_ID) 
        REFERENCES PRODUCTS(PRODUCT_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_INVENTORY_STOCK CHECK (STOCK_QUANTITY >= 0)
);

-- ---------------------------------------------------------------------
-- 5. SHOPPING_CART Table
-- Active user shopping cart items
-- ---------------------------------------------------------------------
CREATE TABLE SHOPPING_CART (
    CART_ID    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID    NUMBER NOT NULL,
    PRODUCT_ID NUMBER NOT NULL,
    QUANTITY   NUMBER DEFAULT 1 NOT NULL,
    ADDED_AT   DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT FK_CART_USER FOREIGN KEY (USER_ID) 
        REFERENCES USERS(USER_ID) ON DELETE CASCADE,
    CONSTRAINT FK_CART_PRODUCT FOREIGN KEY (PRODUCT_ID) 
        REFERENCES PRODUCTS(PRODUCT_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_CART_QUANTITY CHECK (QUANTITY > 0)
);

-- ---------------------------------------------------------------------
-- 6. ORDERS Table
-- Customer purchase orders with status transitions
-- ---------------------------------------------------------------------
CREATE TABLE ORDERS (
    ORDER_ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID          NUMBER NOT NULL,
    ORDER_DATE       DATE DEFAULT SYSDATE NOT NULL,
    TOTAL_AMOUNT     NUMBER(10, 2) NOT NULL,
    ORDER_STATUS     VARCHAR2(30) DEFAULT 'Placed' NOT NULL,
    SHIPPING_ADDRESS VARCHAR2(300),
    CONSTRAINT FK_ORDERS_USER FOREIGN KEY (USER_ID) 
        REFERENCES USERS(USER_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_ORDERS_AMOUNT CHECK (TOTAL_AMOUNT >= 0),
    CONSTRAINT CHK_ORDERS_STATUS CHECK (
        ORDER_STATUS IN ('Placed', 'Shipped', 'Delivered', 'Cancelled')
    )
);

-- ---------------------------------------------------------------------
-- 7. ORDER_DETAILS Table
-- Line items associated with customer orders
-- ---------------------------------------------------------------------
CREATE TABLE ORDER_DETAILS (
    DETAIL_ID  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ORDER_ID   NUMBER NOT NULL,
    PRODUCT_ID NUMBER NOT NULL,
    QUANTITY   NUMBER NOT NULL,
    PRICE      NUMBER(10, 2) NOT NULL,
    CONSTRAINT FK_DETAILS_ORDER FOREIGN KEY (ORDER_ID) 
        REFERENCES ORDERS(ORDER_ID) ON DELETE CASCADE,
    CONSTRAINT FK_DETAILS_PRODUCT FOREIGN KEY (PRODUCT_ID) 
        REFERENCES PRODUCTS(PRODUCT_ID),
    CONSTRAINT CHK_DETAILS_QUANTITY CHECK (QUANTITY > 0),
    CONSTRAINT CHK_DETAILS_PRICE CHECK (PRICE >= 0)
);

-- ---------------------------------------------------------------------
-- 8. PAYMENTS Table
-- Transaction records linked to orders
-- ---------------------------------------------------------------------
CREATE TABLE PAYMENTS (
    PAYMENT_ID     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ORDER_ID       NUMBER NOT NULL,
    PAYMENT_METHOD VARCHAR2(50) NOT NULL,
    PAYMENT_STATUS VARCHAR2(30) DEFAULT 'Pending' NOT NULL,
    PAYMENT_DATE   DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT FK_PAYMENTS_ORDER FOREIGN KEY (ORDER_ID) 
        REFERENCES ORDERS(ORDER_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_PAYMENTS_STATUS CHECK (
        PAYMENT_STATUS IN ('Pending', 'Completed', 'Failed', 'Refunded')
    )
);

-- ---------------------------------------------------------------------
-- 9. SUPPORT_TICKETS Table
-- Customer service and order inquiry tickets with auto-priority
-- ---------------------------------------------------------------------
CREATE TABLE SUPPORT_TICKETS (
    TICKET_ID   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID     NUMBER NOT NULL,
    ORDER_ID    NUMBER,
    ISSUE_TYPE  VARCHAR2(50) NOT NULL,
    DESCRIPTION VARCHAR2(1000) NOT NULL,
    STATUS      VARCHAR2(30) DEFAULT 'Open' NOT NULL,
    PRIORITY    VARCHAR2(20) DEFAULT 'Low' NOT NULL,
    CREATED_AT  DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT FK_TICKETS_USER FOREIGN KEY (USER_ID) 
        REFERENCES USERS(USER_ID) ON DELETE CASCADE,
    CONSTRAINT FK_TICKETS_ORDER FOREIGN KEY (ORDER_ID) 
        REFERENCES ORDERS(ORDER_ID) ON DELETE SET NULL,
    CONSTRAINT CHK_TICKETS_STATUS CHECK (
        STATUS IN ('Open', 'In Progress', 'Resolved', 'Closed')
    ),
    CONSTRAINT CHK_TICKETS_PRIORITY CHECK (
        PRIORITY IN ('Low', 'Medium', 'High')
    ),
    CONSTRAINT CHK_TICKETS_TYPE CHECK (
        ISSUE_TYPE IN ('Delayed Delivery', 'Refund Request', 'Damaged Product', 'Payment Issue', 'Other')
    )
);

-- ---------------------------------------------------------------------
-- 10. SUPPORT_FEEDBACK Table
-- Ratings (1 to 5 stars) and comments exclusively for resolved tickets
-- ---------------------------------------------------------------------
CREATE TABLE SUPPORT_FEEDBACK (
    FEEDBACK_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TICKET_ID   NUMBER NOT NULL,
    RATING      NUMBER(1) NOT NULL,
    COMMENTS    VARCHAR2(1000),
    CONSTRAINT UQ_FEEDBACK_TICKET UNIQUE (TICKET_ID),
    CONSTRAINT FK_FEEDBACK_TICKET FOREIGN KEY (TICKET_ID) 
        REFERENCES SUPPORT_TICKETS(TICKET_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_FEEDBACK_RATING CHECK (RATING BETWEEN 1 AND 5)
);

-- ---------------------------------------------------------------------
-- Performance B-Tree Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IDX_USERS_EMAIL ON USERS(EMAIL);
CREATE INDEX IDX_PRODUCTS_CAT ON PRODUCTS(CATEGORY_ID);
CREATE INDEX IDX_ORDERS_USER ON ORDERS(USER_ID);
CREATE INDEX IDX_CART_USER ON SHOPPING_CART(USER_ID);
CREATE INDEX IDX_TICKETS_USER ON SUPPORT_TICKETS(USER_ID);

-- =====================================================================
-- COMMENTED DDL EXAMPLES: ALTER TABLE, DROP TABLE, TRUNCATE TABLE
-- =====================================================================

/*
------------------------------------------------------------------------
-- ALTER TABLE EXAMPLES:
------------------------------------------------------------------------

-- 1. Add a new column to the USERS table:
-- ALTER TABLE USERS ADD (AVATAR_URL VARCHAR2(500));

-- 2. Modify an existing column data type or length:
-- ALTER TABLE USERS MODIFY (PHONE VARCHAR2(40));

-- 3. Add a default value to an existing column:
-- ALTER TABLE PRODUCTS MODIFY (PRICE DEFAULT 0.00);

-- 4. Add a new CHECK constraint to an existing table:
-- ALTER TABLE USERS ADD CONSTRAINT CHK_PHONE_FORMAT 
--     CHECK (REGEXP_LIKE(PHONE, '^[0-9+() -]+$'));

-- 5. Drop a constraint:
-- ALTER TABLE USERS DROP CONSTRAINT CHK_PHONE_FORMAT;

-- 6. Rename a column:
-- ALTER TABLE PRODUCTS RENAME COLUMN IMAGE_URL TO PRODUCT_IMAGE;

-- 7. Drop an unused column:
-- ALTER TABLE USERS DROP COLUMN AVATAR_URL;


------------------------------------------------------------------------
-- DROP TABLE EXAMPLES:
------------------------------------------------------------------------

-- 1. Drop a standalone table:
-- DROP TABLE SHOPPING_CART;

-- 2. Drop a parent table that has child foreign key references:
-- DROP TABLE USERS CASCADE CONSTRAINTS;

-- 3. Drop a table and bypass the Oracle Recycle Bin:
-- DROP TABLE SUPPORT_FEEDBACK PURGE;


------------------------------------------------------------------------
-- TRUNCATE TABLE EXAMPLES:
------------------------------------------------------------------------

-- 1. Quickly delete all rows from a table while keeping its structure:
-- TRUNCATE TABLE SHOPPING_CART;

-- 2. Truncate table and reset its identity column sequence counter:
-- TRUNCATE TABLE PAYMENTS REUSE STORAGE;
*/

COMMIT;
