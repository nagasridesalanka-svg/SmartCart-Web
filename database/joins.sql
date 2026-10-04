-- =====================================================================
-- SmartCart E-Commerce Platform
-- Relational Joins Demonstration Queries
-- Target Database: Oracle SQL / Oracle Database 19c/21c/23c
--
-- Demonstrates INNER JOIN, LEFT JOIN, and RIGHT JOIN queries across:
-- 1. Users with Orders
-- 2. Orders with Payments
-- 3. Products with Categories
-- 4. Users with Support Tickets
-- =====================================================================

-- =====================================================================
-- SECTION 1: USERS WITH ORDERS
-- =====================================================================

-- 1A. INNER JOIN: Users who have placed at least one order
-- Only returns users that have matching order records.
SELECT 
    u.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    o.ORDER_ID,
    o.TOTAL_AMOUNT,
    o.ORDER_STATUS,
    o.ORDER_DATE
FROM USERS u
INNER JOIN ORDERS o ON u.USER_ID = o.USER_ID
ORDER BY o.ORDER_ID DESC;

-- 1B. LEFT JOIN: All registered users and their orders (including users who haven't ordered yet)
-- Preserves all rows from USERS (left table); order fields are NULL for users with 0 orders.
SELECT 
    u.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    u.ROLE,
    o.ORDER_ID,
    o.TOTAL_AMOUNT,
    NVL(o.ORDER_STATUS, 'No Orders Placed') AS ORDER_STATUS
FROM USERS u
LEFT JOIN ORDERS o ON u.USER_ID = o.USER_ID
ORDER BY u.USER_ID ASC, o.ORDER_ID DESC;

-- 1C. RIGHT JOIN: All orders and their associated customer profile
-- Preserves all rows from ORDERS (right table), matching user information where available.
SELECT 
    u.USER_ID,
    u.FULL_NAME AS CUSTOMER_NAME,
    u.EMAIL,
    o.ORDER_ID,
    o.ORDER_DATE,
    o.TOTAL_AMOUNT,
    o.ORDER_STATUS
FROM USERS u
RIGHT JOIN ORDERS o ON u.USER_ID = o.USER_ID
ORDER BY o.ORDER_DATE DESC;


-- =====================================================================
-- SECTION 2: ORDERS WITH PAYMENTS
-- =====================================================================

-- 2A. INNER JOIN: Orders that have an associated payment record
-- Returns orders with confirmed transaction references.
SELECT 
    o.ORDER_ID,
    o.ORDER_DATE,
    o.TOTAL_AMOUNT,
    o.ORDER_STATUS,
    p.PAYMENT_ID,
    p.PAYMENT_METHOD,
    p.PAYMENT_STATUS,
    p.PAYMENT_DATE
FROM ORDERS o
INNER JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
ORDER BY o.ORDER_ID DESC;

-- 2B. LEFT JOIN: All orders and their payment status (including orders awaiting payment processing)
-- Preserves all rows from ORDERS; payment details are NULL if not yet created.
SELECT 
    o.ORDER_ID,
    o.TOTAL_AMOUNT,
    o.ORDER_STATUS,
    NVL(p.PAYMENT_METHOD, 'Pending Selection') AS PAYMENT_METHOD,
    NVL(p.PAYMENT_STATUS, 'Unpaid') AS PAYMENT_STATUS,
    p.PAYMENT_DATE
FROM ORDERS o
LEFT JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
ORDER BY o.ORDER_ID DESC;

-- 2C. RIGHT JOIN: All payments linked to their parent order details
-- Preserves all rows from PAYMENTS (right table).
SELECT 
    p.PAYMENT_ID,
    p.PAYMENT_METHOD,
    p.PAYMENT_STATUS,
    p.PAYMENT_DATE,
    o.ORDER_ID,
    o.TOTAL_AMOUNT AS ORDER_TOTAL,
    o.ORDER_STATUS
FROM ORDERS o
RIGHT JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
ORDER BY p.PAYMENT_ID DESC;


-- =====================================================================
-- SECTION 3: PRODUCTS WITH CATEGORIES
-- =====================================================================

-- 3A. INNER JOIN: Products and their assigned category details
-- Matches active catalog products with their parent department.
SELECT 
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    p.PRICE,
    c.CATEGORY_ID,
    c.CATEGORY_NAME,
    c.DESCRIPTION AS CATEGORY_DESCRIPTION
FROM PRODUCTS p
INNER JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
ORDER BY c.CATEGORY_NAME, p.PRODUCT_NAME;

-- 3B. LEFT JOIN: All products and their category (safeguards against uncategorized items)
-- Preserves all products even if category assignment is absent.
SELECT 
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    p.PRICE,
    p.IS_ACTIVE,
    NVL(c.CATEGORY_NAME, 'Uncategorized') AS CATEGORY_NAME
FROM PRODUCTS p
LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
ORDER BY p.PRODUCT_ID ASC;

-- 3C. RIGHT JOIN: All categories and their products (including categories without products)
-- Preserves all categories from CATEGORIES (right table) even if no products are assigned.
SELECT 
    c.CATEGORY_ID,
    c.CATEGORY_NAME,
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    p.PRICE
FROM PRODUCTS p
RIGHT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
ORDER BY c.CATEGORY_ID ASC, p.PRODUCT_NAME ASC;


-- =====================================================================
-- SECTION 4: USERS WITH SUPPORT TICKETS
-- =====================================================================

-- 4A. INNER JOIN: Users who have submitted support tickets
-- Returns inquiries along with submitter credentials.
SELECT 
    u.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    st.TICKET_ID,
    st.ISSUE_TYPE,
    st.PRIORITY,
    st.STATUS AS TICKET_STATUS,
    st.CREATED_AT AS TICKET_DATE
FROM USERS u
INNER JOIN SUPPORT_TICKETS st ON u.USER_ID = st.USER_ID
ORDER BY st.TICKET_ID DESC;

-- 4B. LEFT JOIN: All registered users and their support ticket history
-- Preserves all users; ticket fields are NULL for customers who have never opened an inquiry.
SELECT 
    u.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    u.ROLE,
    st.TICKET_ID,
    NVL(st.ISSUE_TYPE, 'None Logged') AS ISSUE_TYPE,
    NVL(st.STATUS, 'No Tickets') AS TICKET_STATUS
FROM USERS u
LEFT JOIN SUPPORT_TICKETS st ON u.USER_ID = st.USER_ID
ORDER BY u.USER_ID ASC, st.TICKET_ID DESC;

-- 4C. RIGHT JOIN: All support tickets and their associated customer profile
-- Preserves all rows from SUPPORT_TICKETS (right table).
SELECT 
    st.TICKET_ID,
    st.ISSUE_TYPE,
    st.PRIORITY,
    st.STATUS,
    st.DESCRIPTION,
    u.USER_ID,
    u.FULL_NAME AS CUSTOMER_NAME,
    u.EMAIL AS CUSTOMER_EMAIL,
    u.PHONE AS CUSTOMER_PHONE
FROM USERS u
RIGHT JOIN SUPPORT_TICKETS st ON u.USER_ID = st.USER_ID
ORDER BY st.TICKET_ID DESC;
