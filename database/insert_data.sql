-- =====================================================================
-- SmartCart E-Commerce Platform
-- Initial Data Seeding Script
-- Target Database: Oracle SQL / Oracle Database 19c/21c
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Insert Categories (5 Categories)
-- ---------------------------------------------------------------------
INSERT INTO CATEGORIES (CATEGORY_ID, CATEGORY_NAME, DESCRIPTION) 
VALUES (1, 'Electronics', 'Laptops, audio equipment, smartphones, and smart workspace gadgets');

INSERT INTO CATEGORIES (CATEGORY_ID, CATEGORY_NAME, DESCRIPTION) 
VALUES (2, 'Fashion & Apparel', 'Minimalist wardrobe staples, organic cotton wear, and everyday essentials');

INSERT INTO CATEGORIES (CATEGORY_ID, CATEGORY_NAME, DESCRIPTION) 
VALUES (3, 'Home & Living', 'Clean aesthetic furniture, ambient lighting, and functional home decor');

INSERT INTO CATEGORIES (CATEGORY_ID, CATEGORY_NAME, DESCRIPTION) 
VALUES (4, 'Books & Stationery', 'Curated architectural books, premium fountain pens, and minimal notebooks');

INSERT INTO CATEGORIES (CATEGORY_ID, CATEGORY_NAME, DESCRIPTION) 
VALUES (5, 'Health & Wellness', 'Clean skincare formulations, wellness tools, and daily mindfulness essentials');

-- ---------------------------------------------------------------------
-- 2. Insert Users (1 Admin, 1 Customer)
-- Passwords shown here represent bcrypt-hashed values
-- Admin: Admin@123
-- Customer: Customer@123
-- ---------------------------------------------------------------------
INSERT INTO USERS (USER_ID, FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
VALUES (
    1, 
    'System Administrator', 
    'admin@smartcart.com', 
    '$2a$10$r94XkU/uDk6c2L7aLpI0neXn3zN6j/G7m2hYgD6qM5X8aQ7hI.yvK', 
    '+1 (555) 019-9000', 
    '100 Tech Hub Boulevard, Suite 500, San Francisco, CA 94107', 
    'admin', 
    SYSTIMESTAMP
);

INSERT INTO USERS (USER_ID, FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
VALUES (
    2, 
    'John Doe', 
    'john.doe@example.com', 
    '$2a$10$wT0l0g5y8E5L6g9K4b6RteI0Xl6w9D6n8M4X3aQ2hI.jvL4b7w8i.', 
    '+1 (555) 014-2345', 
    '742 Evergreen Terrace, Springfield, OR 97477', 
    'customer', 
    SYSTIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. Insert Products (16 Products across 5 categories)
-- ---------------------------------------------------------------------
-- Electronics (Category 1)
INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    1, 1, 'AeroSound Pro Noise-Cancelling Headphones',
    'Precision-engineered over-ear wireless headphones with active noise cancellation, 40-hour battery life, and plush memory foam ear cushions.',
    249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    2, 1, 'Studio Minimalist Mechanical Keyboard',
    'Compact 75% layout keyboard with custom lubricated linear switches, solid aluminum chassis, and subtle warm white backlighting.',
    129.50, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    3, 1, 'OmniCharge MagFast Wireless Charging Stand',
    'Machined aluminum multi-device charging hub with magnetic fast charging for smartphones, earbuds, and smartwatch concurrently.',
    79.00, 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    4, 1, 'Verve Smart Fitness Timepiece',
    'Ultra-slim titanium smartwatch with continuous biometric tracking, sapphire crystal glass, and 7-day battery endurance.',
    199.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

-- Fashion & Apparel (Category 2)
INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    5, 2, 'Heritage Organic Heavyweight Tee',
    'Crafted from 100% GOTS-certified combed organic cotton with a relaxed boxy cut, reinforced crew neckline, and pre-shrunk finish.',
    38.00, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    6, 2, 'Komorebi Wool Blend Overcoat',
    'Tailored minimalist overcoat woven from recycled Italian wool blend with hidden horn button placket and satin lining.',
    289.00, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    7, 2, 'Everyday Canvas Commuter Backpack',
    'Weatherproof waxed canvas rucksack with 16-inch padded laptop sleeve, quick-access passport pocket, and vegetable-tanned leather trim.',
    115.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

-- Home & Living (Category 3)
INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    8, 3, 'Lumina Architectural Desk Lamp',
    'Minimal cantilever desk lamp with touch-dimmable warm LED, rotating counterbalanced arm, and brass joints.',
    89.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    9, 3, 'Artisan Ceramic Pour-Over Dripper Set',
    'Handcrafted stoneware pour-over dripper with matched 600ml server pitcher, finished in matte speckled sand glaze.',
    48.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    10, 3, 'Nordic Solid Oak Floating Shelf',
    'Sustainably harvested white oak wall shelf with hidden heavy-duty bracket mounting, natural beeswax wax finish.',
    64.00, 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    11, 3, 'Aroma Ultrasonic Ceramic Diffuser',
    'Sculptural stone-matte essential oil diffuser with whisper-quiet ultrasonic atomization and gentle warm glow night mode.',
    55.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

-- Books & Stationery (Category 4)
INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    12, 4, 'Grid & Form: Modern Graphic Architecture',
    'Hardcover monograph detailing structural grid systems, modernist typography, and rational visual systems worldwide.',
    42.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    13, 4, 'Brass Precision Fountain Pen',
    'Solid untreated brass writing instrument with German Schmidt iridium nib, balanced weight, and developing natural patina.',
    68.00, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    14, 4, 'Smyth-Sewn Hardcover Grid Journal',
    'Lays flat 180 degrees. 240 numbered pages of 120gsm fountain-pen friendly Japanese paper with subtle 5mm dot grid.',
    26.00, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

-- Health & Wellness (Category 5)
INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    15, 5, 'Botanical Restorative Facial Oil',
    'Cold-pressed jojoba, rosehip seed, and blue tansy blend to soothe skin barrier and restore deep hydration overnight.',
    52.00, 'https://images.unsplash.com/photo-1608248597359-5613532b43b6?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

INSERT INTO PRODUCTS (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (
    16, 5, 'Cast Iron Kettlebell 16kg',
    'Single-pour gravity cast iron bell with smooth color-coded handle, flat machined base, and chip-resistant powder coating.',
    74.00, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80', 1, SYSTIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. Insert Inventory (Stock for all 16 products)
-- ---------------------------------------------------------------------
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (1, 1, 45, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (2, 2, 28, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (3, 3, 72, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (4, 4, 30, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (5, 5, 120, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (6, 6, 18, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (7, 7, 50, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (8, 8, 35, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (9, 9, 65, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (10, 10, 22, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (11, 11, 40, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (12, 12, 85, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (13, 13, 60, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (14, 14, 150, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (15, 15, 90, SYSTIMESTAMP);
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED) VALUES (16, 16, 14, SYSTIMESTAMP);

-- ---------------------------------------------------------------------
-- 5. Insert Sample Shopping Cart Item
-- ---------------------------------------------------------------------
INSERT INTO SHOPPING_CART (CART_ID, USER_ID, PRODUCT_ID, QUANTITY, ADDED_AT)
VALUES (1, 2, 1, 1, SYSTIMESTAMP);

-- ---------------------------------------------------------------------
-- 6. Insert Sample Orders & Order Details
-- ---------------------------------------------------------------------
INSERT INTO ORDERS (ORDER_ID, USER_ID, ORDER_DATE, TOTAL_AMOUNT, ORDER_STATUS)
VALUES (101, 2, SYSTIMESTAMP - INTERVAL '5' DAY, 379.49, 'Delivered');

INSERT INTO ORDER_DETAILS (DETAIL_ID, ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
VALUES (1, 101, 1, 1, 249.99);

INSERT INTO ORDER_DETAILS (DETAIL_ID, ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
VALUES (2, 101, 2, 1, 129.50);

INSERT INTO PAYMENTS (PAYMENT_ID, ORDER_ID, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_DATE)
VALUES (501, 101, 'Credit Card', 'Completed', SYSTIMESTAMP - INTERVAL '5' DAY);

-- ---------------------------------------------------------------------
-- 7. Insert Sample Support Ticket & Feedback
-- ---------------------------------------------------------------------
INSERT INTO SUPPORT_TICKETS (TICKET_ID, USER_ID, ORDER_ID, ISSUE_TYPE, DESCRIPTION, STATUS, PRIORITY, CREATED_AT)
VALUES (
    1, 2, 101, 'Delivery Tracking',
    'Checking delivery confirmation details for the mechanical keyboard and headphones package.',
    'Resolved', 'Medium', SYSTIMESTAMP - INTERVAL '4' DAY
);

INSERT INTO SUPPORT_FEEDBACK (FEEDBACK_ID, TICKET_ID, RATING, COMMENTS)
VALUES (1, 1, 5, 'Quick resolution and accurate courier update. Very satisfied!');

COMMIT;
