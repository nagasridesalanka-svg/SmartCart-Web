-- =====================================================================
-- SmartCart E-Commerce Platform
-- Database Views
-- Target Database: Oracle SQL / Oracle Database 19c/21c/23c
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VIEW_ORDER_SUMMARY
-- Aggregated summary of orders with customer details, item quantities, and payment status
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_ORDER_SUMMARY AS
SELECT 
    o.ORDER_ID,
    o.ORDER_DATE,
    o.ORDER_STATUS,
    o.TOTAL_AMOUNT,
    o.SHIPPING_ADDRESS,
    u.USER_ID,
    u.FULL_NAME AS CUSTOMER_NAME,
    u.EMAIL AS CUSTOMER_EMAIL,
    u.PHONE AS CUSTOMER_PHONE,
    NVL(COUNT(od.DETAIL_ID), 0) AS TOTAL_LINE_ITEMS,
    NVL(SUM(od.QUANTITY), 0) AS TOTAL_ITEMS_COUNT,
    NVL(p.PAYMENT_METHOD, 'Not Recorded') AS PAYMENT_METHOD,
    NVL(p.PAYMENT_STATUS, 'Pending') AS PAYMENT_STATUS
FROM ORDERS o
JOIN USERS u ON o.USER_ID = u.USER_ID
LEFT JOIN ORDER_DETAILS od ON o.ORDER_ID = od.ORDER_ID
LEFT JOIN PAYMENTS p ON o.ORDER_ID = p.ORDER_ID
GROUP BY 
    o.ORDER_ID, o.ORDER_DATE, o.ORDER_STATUS, o.TOTAL_AMOUNT, 
    o.SHIPPING_ADDRESS, u.USER_ID, u.FULL_NAME, u.EMAIL, u.PHONE,
    p.PAYMENT_METHOD, p.PAYMENT_STATUS;

-- ---------------------------------------------------------------------
-- 2. VIEW_LOW_STOCK_PRODUCTS
-- Identifies products requiring restocking (stock below 5 units)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_LOW_STOCK_PRODUCTS AS
SELECT 
    p.PRODUCT_ID,
    p.PRODUCT_NAME,
    c.CATEGORY_NAME,
    p.PRICE,
    NVL(i.STOCK_QUANTITY, 0) AS STOCK_QUANTITY,
    i.LAST_UPDATED,
    CASE 
        WHEN NVL(i.STOCK_QUANTITY, 0) = 0 THEN 'OUT OF STOCK'
        WHEN NVL(i.STOCK_QUANTITY, 0) <= 2 THEN 'CRITICAL STOCK'
        ELSE 'LOW STOCK'
    END AS REORDER_STATUS
FROM PRODUCTS p
JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
WHERE NVL(i.STOCK_QUANTITY, 0) < 5
  AND p.IS_ACTIVE = 1;

-- ---------------------------------------------------------------------
-- 3. VIEW_OPEN_TICKETS
-- Unresolved support tickets requiring administrative attention
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_OPEN_TICKETS AS
SELECT 
    st.TICKET_ID,
    st.ISSUE_TYPE,
    st.PRIORITY,
    st.STATUS,
    st.DESCRIPTION,
    st.CREATED_AT,
    ROUND(SYSDATE - st.CREATED_AT, 1) AS TICKET_AGE_DAYS,
    u.USER_ID,
    u.FULL_NAME AS CUSTOMER_NAME,
    u.EMAIL AS CUSTOMER_EMAIL,
    u.PHONE AS CUSTOMER_PHONE,
    st.ORDER_ID,
    o.TOTAL_AMOUNT AS RELATED_ORDER_TOTAL,
    o.ORDER_STATUS AS RELATED_ORDER_STATUS
FROM SUPPORT_TICKETS st
JOIN USERS u ON st.USER_ID = u.USER_ID
LEFT JOIN ORDERS o ON st.ORDER_ID = o.ORDER_ID
WHERE st.STATUS IN ('Open', 'In Progress');

-- ---------------------------------------------------------------------
-- 4. VIEW_CATEGORY_SALES_SUMMARY (Bonus View)
-- Financial revenue and unit volume generated per product category
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VIEW_CATEGORY_SALES_SUMMARY AS
SELECT 
    c.CATEGORY_ID,
    c.CATEGORY_NAME,
    COUNT(DISTINCT p.PRODUCT_ID) AS TOTAL_PRODUCTS_IN_CATEGORY,
    NVL(SUM(od.QUANTITY), 0) AS TOTAL_UNITS_SOLD,
    NVL(ROUND(SUM(od.QUANTITY * od.PRICE), 2), 0) AS TOTAL_CATEGORY_REVENUE
FROM CATEGORIES c
LEFT JOIN PRODUCTS p ON c.CATEGORY_ID = p.CATEGORY_ID
LEFT JOIN ORDER_DETAILS od ON p.PRODUCT_ID = od.PRODUCT_ID
GROUP BY c.CATEGORY_ID, c.CATEGORY_NAME;

COMMIT;
