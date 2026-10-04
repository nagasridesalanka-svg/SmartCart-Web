-- =====================================================================
-- SmartCart E-Commerce Platform
-- Relational Joins Demonstration Queries
-- Target Database: Oracle SQL / Oracle Database 19c/21c
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. INNER JOIN: Products with Category Details and Inventory Levels
-- Returns all active products with category names and stock quantities
-- ---------------------------------------------------------------------
SELECT 
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    c.CATEGORY_NAME,
    p.PRICE,
    i.STOCK_QUANTITY
FROM PRODUCTS p
INNER JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
INNER JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
WHERE p.IS_ACTIVE = 1
ORDER BY c.CATEGORY_NAME, p.PRODUCT_NAME;

-- ---------------------------------------------------------------------
-- 2. LEFT JOIN: All Categories with Product Count (including empty ones)
-- Illustrates categories even if no products are assigned yet
-- ---------------------------------------------------------------------
SELECT 
    c.CATEGORY_ID,
    c.CATEGORY_NAME,
    COUNT(p.PRODUCT_ID) AS PRODUCT_COUNT
FROM CATEGORIES c
LEFT JOIN PRODUCTS p ON c.CATEGORY_ID = p.CATEGORY_ID AND p.IS_ACTIVE = 1
GROUP BY c.CATEGORY_ID, c.CATEGORY_NAME
ORDER BY PRODUCT_COUNT DESC;

-- ---------------------------------------------------------------------
-- 3. MULTI-TABLE JOIN: Detailed Order Breakdown with User, Products & Payment
-- Combines Orders, Users, Order Details, Products, and Payments
-- ---------------------------------------------------------------------
SELECT 
    o.ORDER_ID,
    u.FULL_NAME AS CUSTOMER_NAME,
    u.EMAIL,
    p.PRODUCT_NAME,
    od.QUANTITY,
    od.PRICE AS UNIT_PRICE,
    (od.QUANTITY * od.PRICE) AS ITEM_SUBTOTAL,
    o.TOTAL_AMOUNT AS ORDER_TOTAL,
    pay.PAYMENT_METHOD,
    pay.PAYMENT_STATUS
FROM ORDERS o
INNER JOIN USERS u ON o.USER_ID = u.USER_ID
INNER JOIN ORDER_DETAILS od ON o.ORDER_ID = od.ORDER_ID
INNER JOIN PRODUCTS p ON od.PRODUCT_ID = p.PRODUCT_ID
LEFT JOIN PAYMENTS pay ON o.ORDER_ID = pay.ORDER_ID
ORDER BY o.ORDER_DATE DESC, od.DETAIL_ID ASC;

-- ---------------------------------------------------------------------
-- 4. LEFT JOIN: Support Tickets and Associated Order & Feedback
-- ---------------------------------------------------------------------
SELECT 
    st.TICKET_ID,
    u.FULL_NAME AS CUSTOMER,
    st.ISSUE_TYPE,
    st.STATUS,
    st.PRIORITY,
    o.ORDER_ID,
    o.ORDER_STATUS,
    sf.RATING,
    sf.COMMENTS
FROM SUPPORT_TICKETS st
INNER JOIN USERS u ON st.USER_ID = u.USER_ID
LEFT JOIN ORDERS o ON st.ORDER_ID = o.ORDER_ID
LEFT JOIN SUPPORT_FEEDBACK sf ON st.TICKET_ID = sf.TICKET_ID;
