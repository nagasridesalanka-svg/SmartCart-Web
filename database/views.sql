-- =====================================================================
-- SmartCart E-Commerce Platform
-- Database Views
-- Target Database: Oracle SQL / Oracle Database 19c/21c
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VIEW_CATALOG_PRODUCTS
-- Comprehensive product listing with category name and stock quantity
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_CATALOG_PRODUCTS AS
SELECT 
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    p.PRICE,
    p.IMAGE_URL,
    p.IS_ACTIVE,
    c.CATEGORY_ID,
    c.CATEGORY_NAME,
    NVL(i.STOCK_QUANTITY, 0) AS STOCK_QUANTITY,
    CASE 
        WHEN NVL(i.STOCK_QUANTITY, 0) <= 0 THEN 'Out of Stock'
        WHEN NVL(i.STOCK_QUANTITY, 0) < 20 THEN 'Low Stock'
        ELSE 'In Stock'
    END AS STOCK_STATUS
FROM PRODUCTS p
JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
WHERE p.IS_ACTIVE = 1;

-- ---------------------------------------------------------------------
-- 2. VIEW_CUSTOMER_ORDERS
-- Order history summary per customer with total lines and payment state
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_CUSTOMER_ORDERS AS
SELECT 
    o.ORDER_ID,
    o.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    o.ORDER_DATE,
    o.TOTAL_AMOUNT,
    o.ORDER_STATUS,
    COUNT(od.DETAIL_ID) AS TOTAL_ITEMS_ORDERED,
    p.PAYMENT_METHOD,
    p.PAYMENT_STATUS
FROM ORDERS o
JOIN USERS u ON o.USER_ID = u.USER_ID
LEFT JOIN ORDER_DETAILS od ON o.ORDER_ID = od.ORDER_ID
LEFT JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
GROUP BY 
    o.ORDER_ID, o.USER_ID, u.FULL_NAME, u.EMAIL, 
    o.ORDER_DATE, o.TOTAL_AMOUNT, o.ORDER_STATUS,
    p.PAYMENT_METHOD, p.PAYMENT_STATUS;

-- ---------------------------------------------------------------------
-- 3. VIEW_ACTIVE_CARTS
-- Detailed contents of customer shopping carts with price calculations
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_ACTIVE_CARTS AS
SELECT 
    sc.CART_ID,
    sc.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    p.PRICE AS UNIT_PRICE,
    sc.QUANTITY,
    (sc.QUANTITY * p.PRICE) AS LINE_TOTAL,
    sc.ADDED_AT
FROM SHOPPING_CART sc
JOIN USERS u ON sc.USER_ID = u.USER_ID
JOIN PRODUCTS p ON sc.PRODUCT_ID = p.PRODUCT_ID;

-- ---------------------------------------------------------------------
-- 4. VIEW_SUPPORT_TICKETS_SUMMARY
-- Helpdesk ticket dashboard with customer information and ratings
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_SUPPORT_TICKETS_SUMMARY AS
SELECT 
    st.TICKET_ID,
    st.USER_ID,
    u.FULL_NAME AS CUSTOMER_NAME,
    u.EMAIL AS CUSTOMER_EMAIL,
    st.ORDER_ID,
    st.ISSUE_TYPE,
    st.PRIORITY,
    st.STATUS,
    st.CREATED_AT,
    sf.RATING,
    sf.COMMENTS AS FEEDBACK_COMMENTS
FROM SUPPORT_TICKETS st
JOIN USERS u ON st.USER_ID = u.USER_ID
LEFT JOIN SUPPORT_FEEDBACK sf ON st.TICKET_ID = sf.TICKET_ID;
