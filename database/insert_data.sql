-- =====================================================================
-- SmartCart E-Commerce Platform
-- Initial Data Seeding Script
-- Target Database: Oracle SQL / Oracle Database 19c/21c/23c
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Insert Categories (5 Categories)
-- ---------------------------------------------------------------------
INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) 
VALUES ('Electronics', 'Laptops, audio equipment, smart peripherals, and workspace gadgets');

INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) 
VALUES ('Fashion & Apparel', 'Minimalist wardrobe staples, heavyweight tees, and functional accessories');

INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) 
VALUES ('Home & Living', 'Clean aesthetic furniture, ambient lighting, and artisanal homeware');

INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) 
VALUES ('Books & Stationery', 'Curated architectural books, brass writing instruments, and dot grid journals');

INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) 
VALUES ('Health & Wellness', 'Clean skincare formulations, fitness accessories, and daily mindfulness essentials');

-- ---------------------------------------------------------------------
-- 2. Insert Users (3 Users: 1 Admin, 2 Customers)
-- Passwords stored as industry-standard bcrypt hashes (Cost factor 10)
-- ---------------------------------------------------------------------
INSERT INTO USERS (FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
VALUES (
    'System Administrator', 
    'admin@smartcart.com', 
    '$2a$10$r94XkU/uDk6c2L7aLpI0neXn3zN6j/G7m2hYgD6qM5X8aQ7hI.yvK', 
    '5550199000', 
    '100 Tech Hub Boulevard, Suite 500, San Francisco, CA 94107', 
    'admin', 
    SYSDATE - 60
);

INSERT INTO USERS (FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
VALUES (
    'John Doe', 
    'john.doe@example.com', 
    '$2a$10$wT0l0g5y8E5L6g9K4b6RteI0Xl6w9D6n8M4X3aQ2hI.jvL4b7w8i.', 
    '5550142345', 
    '742 Evergreen Terrace, Springfield, OR 97477', 
    'customer', 
    SYSDATE - 30
);

INSERT INTO USERS (FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
VALUES (
    'Jane Smith', 
    'jane.smith@example.com', 
    '$2a$10$wT0l0g5y8E5L6g9K4b6RteI0Xl6w9D6n8M4X3aQ2hI.jvL4b7w8i.', 
    '5550187890', 
    '124 Conch Street, Bikini Bottom, HI 96815', 
    'customer', 
    SYSDATE - 15
);

-- ---------------------------------------------------------------------
-- 3. Insert Products (16 Products across 5 categories)
-- ---------------------------------------------------------------------
-- Category 1: Electronics
INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    1, 'AeroSound Pro Noise-Cancelling Headphones',
    'Precision-engineered over-ear wireless headphones with active noise cancellation, 40-hour battery life, and plush memory foam ear cushions.',
    249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 45
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    1, 'Studio Minimalist Mechanical Keyboard',
    'Compact 75% layout keyboard with custom lubricated linear switches, solid aluminum chassis, and subtle warm white backlighting.',
    129.50, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 40
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    1, 'OmniCharge MagFast Wireless Charging Stand',
    'Machined aluminum multi-device charging hub with magnetic fast charging for smartphones, earbuds, and smartwatch concurrently.',
    79.00, 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 35
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    1, 'Verve Smart Fitness Timepiece',
    'Ultra-slim titanium smartwatch with continuous biometric tracking, sapphire crystal glass, and 7-day battery endurance.',
    199.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 30
);

-- Category 2: Fashion & Apparel
INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    2, 'Heritage Organic Heavyweight Tee',
    'Crafted from 100% GOTS-certified combed organic cotton with a relaxed boxy cut, reinforced crew neckline, and pre-shrunk finish.',
    38.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 30
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    2, 'Komorebi Wool Blend Overcoat',
    'Tailored minimalist overcoat woven from recycled Italian wool blend with hidden horn button placket and satin lining.',
    289.00, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 28
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    2, 'Everyday Canvas Commuter Backpack',
    'Weatherproof waxed canvas rucksack with 16-inch padded laptop sleeve, quick-access passport pocket, and vegetable-tanned leather trim.',
    115.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 25
);

-- Category 3: Home & Living
INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    3, 'Lumina Architectural Desk Lamp',
    'Minimal cantilever desk lamp with touch-dimmable warm LED, rotating counterbalanced arm, and brass joints.',
    89.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 25
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    3, 'Artisan Ceramic Pour-Over Dripper Set',
    'Handcrafted stoneware pour-over dripper with matched 600ml server pitcher, finished in matte speckled sand glaze.',
    48.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 20
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    3, 'Nordic Solid Oak Floating Shelf',
    'Sustainably harvested white oak wall shelf with hidden heavy-duty bracket mounting, natural beeswax wax finish.',
    64.00, 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 20
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    3, 'Aroma Ultrasonic Ceramic Diffuser',
    'Sculptural stone-matte essential oil diffuser with whisper-quiet ultrasonic atomization and gentle warm glow night mode.',
    55.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 18
);

-- Category 4: Books & Stationery
INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    4, 'Grid & Form: Modern Graphic Architecture',
    'Hardcover monograph detailing structural grid systems, modernist typography, and rational visual systems worldwide.',
    42.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 15
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    4, 'Brass Precision Fountain Pen',
    'Solid untreated brass writing instrument with German Schmidt iridium nib, balanced weight, and developing natural patina.',
    68.00, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 15
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    4, 'Smyth-Sewn Hardcover Grid Journal',
    'Lays flat 180 degrees. 240 numbered pages of 120gsm fountain-pen friendly Japanese paper with subtle 5mm dot grid.',
    26.00, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 12
);

-- Category 5: Health & Wellness
INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    5, 'Botanical Restorative Facial Oil',
    'Cold-pressed jojoba, rosehip seed, and blue tansy blend to soothe skin barrier and restore deep hydration overnight.',
    52.00, 'https://images.unsplash.com/photo-1608248597359-5613532b43b6?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 10
);

INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    5, 'Cast Iron Kettlebell 16kg',
    'Single-pour gravity cast iron bell with smooth color-coded handle, flat machined base, and chip-resistant powder coating.',
    74.00, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80', 1, SYSDATE - 10
);

-- ---------------------------------------------------------------------
-- 4. Insert Inventory (Stock for all 16 products, including low stock items)
-- ---------------------------------------------------------------------
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (1, 45, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (2, 28, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (3, 72, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (4, 30, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (5, 120, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (6, 3, SYSDATE); -- Low stock (<5)
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (7, 50, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (8, 35, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (9, 65, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (10, 4, SYSDATE); -- Low stock (<5)
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (11, 40, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (12, 85, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (13, 60, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (14, 150, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (15, 90, SYSDATE);
INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (16, 2, SYSDATE); -- Low stock (<5)

-- ---------------------------------------------------------------------
-- 5. Insert Sample Shopping Cart Items
-- ---------------------------------------------------------------------
INSERT INTO SHOPPING_CART (USER_ID, PRODUCT_ID, QUANTITY, ADDED_AT) VALUES (2, 3, 1, SYSDATE - 1);
INSERT INTO SHOPPING_CART (USER_ID, PRODUCT_ID, QUANTITY, ADDED_AT) VALUES (3, 5, 2, SYSDATE);

-- ---------------------------------------------------------------------
-- 6. Insert Sample Orders, Line Details, and Payments
-- ---------------------------------------------------------------------
-- Order 1: John Doe (Delivered)
INSERT INTO ORDERS (USER_ID, ORDER_DATE, TOTAL_AMOUNT, ORDER_STATUS, SHIPPING_ADDRESS)
VALUES (2, SYSDATE - 10, 379.49, 'Delivered', '742 Evergreen Terrace, Springfield, OR 97477');

INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) VALUES (1, 1, 1, 249.99);
INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) VALUES (1, 2, 1, 129.50);

INSERT INTO PAYMENTS (ORDER_ID, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_DATE)
VALUES (1, 'Credit Card', 'Completed', SYSDATE - 10);

-- Order 2: Jane Smith (Shipped)
INSERT INTO ORDERS (USER_ID, ORDER_DATE, TOTAL_AMOUNT, ORDER_STATUS, SHIPPING_ADDRESS)
VALUES (3, SYSDATE - 3, 249.99, 'Shipped', '124 Conch Street, Bikini Bottom, HI 96815');

INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) VALUES (2, 1, 1, 249.99);

INSERT INTO PAYMENTS (ORDER_ID, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_DATE)
VALUES (2, 'UPI', 'Completed', SYSDATE - 3);

-- Order 3: John Doe (Placed)
INSERT INTO ORDERS (USER_ID, ORDER_DATE, TOTAL_AMOUNT, ORDER_STATUS, SHIPPING_ADDRESS)
VALUES (2, SYSDATE - 1, 153.00, 'Placed', '742 Evergreen Terrace, Springfield, OR 97477');

INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) VALUES (3, 5, 1, 38.00);
INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE) VALUES (3, 7, 1, 115.00);

INSERT INTO PAYMENTS (ORDER_ID, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_DATE)
VALUES (3, 'Cash on Delivery', 'Pending', SYSDATE - 1);

-- ---------------------------------------------------------------------
-- 7. Insert Sample Support Tickets & Feedback
-- ---------------------------------------------------------------------
-- Ticket 1: Resolved with Feedback (John Doe)
INSERT INTO SUPPORT_TICKETS (USER_ID, ORDER_ID, ISSUE_TYPE, DESCRIPTION, STATUS, PRIORITY, CREATED_AT)
VALUES (
    2, 1, 'Delayed Delivery',
    'Package courier transit was delayed past estimated delivery date.',
    'Resolved', 'Low', SYSDATE - 8
);

INSERT INTO SUPPORT_FEEDBACK (TICKET_ID, RATING, COMMENTS)
VALUES (1, 5, 'Support team reached out to the courier immediately and expedited my package. Outstanding service!');

-- Ticket 2: Open High Priority (Jane Smith)
INSERT INTO SUPPORT_TICKETS (USER_ID, ORDER_ID, ISSUE_TYPE, DESCRIPTION, STATUS, PRIORITY, CREATED_AT)
VALUES (
    3, 2, 'Payment Issue',
    'Duplicate transaction charge simulation on card statement during checkout.',
    'Open', 'High', SYSDATE - 2
);

-- Ticket 3: In Progress Medium Priority (John Doe)
INSERT INTO SUPPORT_TICKETS (USER_ID, ORDER_ID, ISSUE_TYPE, DESCRIPTION, STATUS, PRIORITY, CREATED_AT)
VALUES (
    2, 3, 'Refund Request',
    'Customer requested return and refund authorization for an accessory item.',
    'In Progress', 'Medium', SYSDATE - 1
);

COMMIT;
