-- =====================================================================
-- SmartCart E-Commerce Platform
-- Aggregate and Analytics Queries
-- Target Database: Oracle SQL / Oracle Database 19c/21c/23c
--
-- Demonstrates Aggregate Functions: COUNT, SUM, AVG, MAX, MIN
-- with Relational Clauses: GROUP BY, HAVING, and ORDER BY
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. REVENUE AND VOLUME PER CATEGORY
-- Uses: COUNT, SUM, AVG, MAX, MIN, GROUP BY, ORDER BY
-- ---------------------------------------------------------------------
SELECT 
    c.CATEGORY_ID,
    c.CATEGORY_NAME,
    COUNT(DISTINCT p.PRODUCT_ID) AS ACTIVE_PRODUCTS_COUNT,
    NVL(SUM(od.QUANTITY), 0) AS TOTAL_UNITS_SOLD,
    NVL(ROUND(SUM(od.QUANTITY * od.PRICE), 2), 0) AS TOTAL_REVENUE,
    NVL(ROUND(AVG(od.PRICE), 2), 0) AS AVG_ITEM_SOLD_PRICE,
    NVL(MIN(od.PRICE), 0) AS MIN_ITEM_PRICE,
    NVL(MAX(od.PRICE), 0) AS MAX_ITEM_PRICE
FROM CATEGORIES c
LEFT JOIN PRODUCTS p ON c.CATEGORY_ID = p.CATEGORY_ID AND p.IS_ACTIVE = 1
LEFT JOIN ORDER_DETAILS od ON p.PRODUCT_ID = od.PRODUCT_ID
GROUP BY c.CATEGORY_ID, c.CATEGORY_NAME
ORDER BY TOTAL_REVENUE DESC, ACTIVE_PRODUCTS_COUNT DESC;


-- ---------------------------------------------------------------------
-- 2. HIGH-VALUE CUSTOMERS (ORDERS PER USER WITH HAVING FILTER)
-- Uses: COUNT, SUM, AVG, GROUP BY, HAVING, ORDER BY
-- Identifies loyal customers who have placed purchases exceeding $100
-- ---------------------------------------------------------------------
SELECT 
    u.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    COUNT(o.ORDER_ID) AS TOTAL_ORDERS_COUNT,
    ROUND(SUM(o.TOTAL_AMOUNT), 2) AS LIFETIME_SPENT,
    ROUND(AVG(o.TOTAL_AMOUNT), 2) AS AVERAGE_ORDER_VALUE,
    MAX(o.TOTAL_AMOUNT) AS LARGEST_SINGLE_ORDER,
    MIN(o.TOTAL_AMOUNT) AS SMALLEST_SINGLE_ORDER
FROM USERS u
INNER JOIN ORDERS o ON u.USER_ID = o.USER_ID
WHERE u.ROLE = 'customer'
GROUP BY u.USER_ID, u.FULL_NAME, u.EMAIL
HAVING SUM(o.TOTAL_AMOUNT) > 100.00
ORDER BY LIFETIME_SPENT DESC;


-- ---------------------------------------------------------------------
-- 3. AVERAGE SUPPORT TICKET RATING & PRIORITY BREAKDOWN
-- Uses: COUNT, AVG, MIN, MAX, GROUP BY, ORDER BY
-- Analyzes resolution satisfaction metrics grouped by ticket priority
-- ---------------------------------------------------------------------
SELECT 
    st.PRIORITY,
    COUNT(st.TICKET_ID) AS TOTAL_TICKETS_LOGGED,
    SUM(CASE WHEN st.STATUS = 'Resolved' THEN 1 ELSE 0 END) AS RESOLVED_TICKETS_COUNT,
    SUM(CASE WHEN st.STATUS = 'Open' THEN 1 ELSE 0 END) AS OPEN_TICKETS_COUNT,
    COUNT(sf.FEEDBACK_ID) AS TOTAL_FEEDBACK_RESPONSES,
    NVL(ROUND(AVG(sf.RATING), 2), 0) AS AVERAGE_CUSTOMER_RATING,
    NVL(MIN(sf.RATING), 0) AS LOWEST_RATING,
    NVL(MAX(sf.RATING), 0) AS HIGHEST_RATING
FROM SUPPORT_TICKETS st
LEFT JOIN SUPPORT_FEEDBACK sf ON st.TICKET_ID = sf.TICKET_ID
GROUP BY st.PRIORITY
ORDER BY TOTAL_TICKETS_LOGGED DESC;


-- ---------------------------------------------------------------------
-- 4. PRODUCT CATALOG PRICING PROFILE PER CATEGORY (WITH HAVING)
-- Uses: COUNT, AVG, MIN, MAX, GROUP BY, HAVING, ORDER BY
-- Filters categories having at least 3 active products
-- ---------------------------------------------------------------------
SELECT 
    c.CATEGORY_NAME,
    COUNT(p.PRODUCT_ID) AS PRODUCTS_IN_CATEGORY,
    ROUND(AVG(p.PRICE), 2) AS AVERAGE_CATALOG_PRICE,
    MIN(p.PRICE) AS MIN_PRODUCT_PRICE,
    MAX(p.PRICE) AS MAX_PRODUCT_PRICE,
    SUM(i.STOCK_QUANTITY) AS TOTAL_UNITS_IN_INVENTORY
FROM CATEGORIES c
INNER JOIN PRODUCTS p ON c.CATEGORY_ID = p.CATEGORY_ID
LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
WHERE p.IS_ACTIVE = 1
GROUP BY c.CATEGORY_ID, c.CATEGORY_NAME
HAVING COUNT(p.PRODUCT_ID) >= 3
ORDER BY AVERAGE_CATALOG_PRICE DESC;


-- ---------------------------------------------------------------------
-- 5. PAYMENT METHODS FINANCIAL PERFORMANCE
-- Uses: COUNT, SUM, AVG, MIN, MAX, GROUP BY, ORDER BY
-- ---------------------------------------------------------------------
SELECT 
    p.PAYMENT_METHOD,
    COUNT(p.PAYMENT_ID) AS TOTAL_TRANSACTIONS,
    SUM(CASE WHEN p.PAYMENT_STATUS = 'Completed' THEN 1 ELSE 0 END) AS SETTLED_TRANSACTIONS,
    ROUND(SUM(o.TOTAL_AMOUNT), 2) AS TOTAL_SETTLED_VOLUME,
    ROUND(AVG(o.TOTAL_AMOUNT), 2) AS AVERAGE_TICKET_SIZE,
    MIN(o.TOTAL_AMOUNT) AS SMALLEST_CHARGE,
    MAX(o.TOTAL_AMOUNT) AS LARGEST_CHARGE
FROM PAYMENTS p
INNER JOIN ORDERS o ON p.ORDER_ID = o.ORDER_ID
GROUP BY p.PAYMENT_METHOD
ORDER BY TOTAL_SETTLED_VOLUME DESC;
