-- =====================================================================
-- SmartCart E-Commerce Platform
-- Aggregate and Analytics Queries
-- Target Database: Oracle SQL / Oracle Database 19c/21c
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Category-Wise Product Stats (Count, Average Price, Min/Max Price)
-- ---------------------------------------------------------------------
SELECT 
    c.CATEGORY_NAME,
    COUNT(p.PRODUCT_ID) AS TOTAL_PRODUCTS,
    ROUND(AVG(p.PRICE), 2) AS AVERAGE_PRICE,
    MIN(p.PRICE) AS MIN_PRICE,
    MAX(p.PRICE) AS MAX_PRICE,
    SUM(i.STOCK_QUANTITY) AS TOTAL_INVENTORY_STOCK
FROM CATEGORIES c
INNER JOIN PRODUCTS p ON c.CATEGORY_ID = p.CATEGORY_ID
LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
GROUP BY c.CATEGORY_ID, c.CATEGORY_NAME
ORDER BY TOTAL_PRODUCTS DESC;

-- ---------------------------------------------------------------------
-- 2. Customer Spending and Total Orders Summary
-- ---------------------------------------------------------------------
SELECT 
    u.USER_ID,
    u.FULL_NAME,
    u.EMAIL,
    COUNT(o.ORDER_ID) AS LIFETIME_ORDERS,
    NVL(SUM(o.TOTAL_AMOUNT), 0) AS LIFETIME_SPEND,
    NVL(ROUND(AVG(o.TOTAL_AMOUNT), 2), 0) AS AVERAGE_ORDER_VALUE
FROM USERS u
LEFT JOIN ORDERS o ON u.USER_ID = o.USER_ID
WHERE u.ROLE = 'customer'
GROUP BY u.USER_ID, u.FULL_NAME, u.EMAIL
ORDER BY LIFETIME_SPEND DESC;

-- ---------------------------------------------------------------------
-- 3. Top Selling Products by Total Units Sold and Revenue Generated
-- ---------------------------------------------------------------------
SELECT 
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    SUM(od.QUANTITY) AS TOTAL_UNITS_SOLD,
    SUM(od.QUANTITY * od.PRICE) AS TOTAL_REVENUE
FROM ORDER_DETAILS od
JOIN PRODUCTS p ON od.PRODUCT_ID = p.PRODUCT_ID
GROUP BY p.PRODUCT_ID, p.PRODUCT_NAME
HAVING SUM(od.QUANTITY) > 0
ORDER BY TOTAL_REVENUE DESC;

-- ---------------------------------------------------------------------
-- 4. Customer Support Performance Metrics
-- Calculates overall average customer satisfaction and status distribution
-- ---------------------------------------------------------------------
SELECT 
    st.STATUS,
    COUNT(st.TICKET_ID) AS TICKET_COUNT,
    ROUND(AVG(sf.RATING), 1) AS AVERAGE_RATING
FROM SUPPORT_TICKETS st
LEFT JOIN SUPPORT_FEEDBACK sf ON st.TICKET_ID = sf.TICKET_ID
GROUP BY st.STATUS;
