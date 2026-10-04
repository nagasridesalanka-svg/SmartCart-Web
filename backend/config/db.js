/**
 * SmartCart - SQLite Relational Database Layer & Initial Seeder
 * Connects directly to SQLite file stored at backend/data/smartcart.db.
 * Uses CREATE TABLE IF NOT EXISTS for all tables and inserts seed data only when tables are empty.
 * Never drops or deletes tables or database file on startup.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and SQLite database file path
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'smartcart.db');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Open SQLite database connection (creates file if it does not exist)
export const sqlite = new DatabaseSync(DB_FILE);

// Enable WAL journal mode and foreign keys for data reliability
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

// Primary key column mappings per schema
const TABLE_PK_MAP = {
  USERS: 'USER_ID',
  CATEGORIES: 'CATEGORY_ID',
  PRODUCTS: 'PRODUCT_ID',
  INVENTORY: 'INVENTORY_ID',
  SHOPPING_CART: 'CART_ID',
  ORDERS: 'ORDER_ID',
  ORDER_DETAILS: 'DETAIL_ID',
  PAYMENTS: 'PAYMENT_ID',
  SUPPORT_TICKETS: 'TICKET_ID',
  SUPPORT_FEEDBACK: 'FEEDBACK_ID'
};

function getPkCol(tableName, customIdCol) {
  if (customIdCol) return customIdCol;
  if (TABLE_PK_MAP[tableName]) return TABLE_PK_MAP[tableName];
  return `${tableName.replace(/S$/, '')}_ID`;
}

/**
 * Initializes tables using CREATE TABLE IF NOT EXISTS
 * Inserts initial seed data only when tables are empty
 */
export function initDB() {
  // 1. Create tables with IF NOT EXISTS
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS USERS (
      USER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      FULL_NAME TEXT NOT NULL,
      EMAIL TEXT NOT NULL UNIQUE,
      PASSWORD TEXT NOT NULL,
      PHONE TEXT,
      ADDRESS TEXT,
      ROLE TEXT DEFAULT 'customer' NOT NULL,
      CREATED_AT TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS CATEGORIES (
      CATEGORY_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      CATEGORY_NAME TEXT NOT NULL UNIQUE,
      DESCRIPTION TEXT
    );

    CREATE TABLE IF NOT EXISTS PRODUCTS (
      PRODUCT_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      CATEGORY_ID INTEGER NOT NULL,
      PRODUCT_NAME TEXT NOT NULL,
      DESCRIPTION TEXT,
      PRICE REAL NOT NULL,
      IMAGE_URL TEXT NOT NULL,
      IS_ACTIVE INTEGER DEFAULT 1 NOT NULL,
      CREATED_AT TEXT NOT NULL,
      FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORIES(CATEGORY_ID)
    );

    CREATE TABLE IF NOT EXISTS INVENTORY (
      INVENTORY_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      PRODUCT_ID INTEGER NOT NULL UNIQUE,
      STOCK_QUANTITY INTEGER DEFAULT 0 NOT NULL,
      LAST_UPDATED TEXT NOT NULL,
      FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCTS(PRODUCT_ID)
    );

    CREATE TABLE IF NOT EXISTS SHOPPING_CART (
      CART_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      USER_ID INTEGER NOT NULL,
      PRODUCT_ID INTEGER NOT NULL,
      QUANTITY INTEGER DEFAULT 1 NOT NULL,
      ADDED_AT TEXT NOT NULL,
      FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID),
      FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCTS(PRODUCT_ID)
    );

    CREATE TABLE IF NOT EXISTS ORDERS (
      ORDER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      USER_ID INTEGER NOT NULL,
      ORDER_DATE TEXT NOT NULL,
      TOTAL_AMOUNT REAL NOT NULL,
      ORDER_STATUS TEXT DEFAULT 'Placed' NOT NULL,
      SHIPPING_ADDRESS TEXT,
      FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID)
    );

    CREATE TABLE IF NOT EXISTS ORDER_DETAILS (
      DETAIL_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ORDER_ID INTEGER NOT NULL,
      PRODUCT_ID INTEGER NOT NULL,
      QUANTITY INTEGER NOT NULL,
      PRICE REAL NOT NULL,
      FOREIGN KEY (ORDER_ID) REFERENCES ORDERS(ORDER_ID),
      FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCTS(PRODUCT_ID)
    );

    CREATE TABLE IF NOT EXISTS PAYMENTS (
      PAYMENT_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ORDER_ID INTEGER NOT NULL,
      PAYMENT_METHOD TEXT NOT NULL,
      PAYMENT_STATUS TEXT DEFAULT 'Pending' NOT NULL,
      PAYMENT_DATE TEXT NOT NULL,
      FOREIGN KEY (ORDER_ID) REFERENCES ORDERS(ORDER_ID)
    );

    CREATE TABLE IF NOT EXISTS SUPPORT_TICKETS (
      TICKET_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      USER_ID INTEGER NOT NULL,
      ORDER_ID INTEGER,
      ISSUE_TYPE TEXT NOT NULL,
      DESCRIPTION TEXT NOT NULL,
      STATUS TEXT DEFAULT 'Open' NOT NULL,
      PRIORITY TEXT DEFAULT 'Medium' NOT NULL,
      CREATED_AT TEXT NOT NULL,
      FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID)
    );

    CREATE TABLE IF NOT EXISTS SUPPORT_FEEDBACK (
      FEEDBACK_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TICKET_ID INTEGER NOT NULL,
      RATING INTEGER NOT NULL,
      COMMENTS TEXT,
      FOREIGN KEY (TICKET_ID) REFERENCES SUPPORT_TICKETS(TICKET_ID)
    );
  `);

  // 2. Check and seed USERS if empty
  const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM USERS').get().count;
  if (userCount === 0) {
    console.log('Seeding initial demo accounts...');
    const adminHash = bcrypt.hashSync('Admin@123', 10);
    const customerHash = bcrypt.hashSync('Customer@123', 10);

    const insertUser = sqlite.prepare(`
      INSERT INTO USERS (FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'Administrator',
      'admin@smartcart.com',
      adminHash,
      '+1 (555) 010-0001',
      '100 Corporate Parkway, Suite 500, Tech District',
      'admin',
      new Date().toISOString()
    );

    insertUser.run(
      'John Doe',
      'john.doe@example.com',
      customerHash,
      '+1 (555) 012-3456',
      '742 Evergreen Terrace, Springfield, OR 97477',
      'customer',
      new Date().toISOString()
    );
  }

  // 3. Check and seed CATEGORIES if empty
  const categoryCount = sqlite.prepare('SELECT COUNT(*) as count FROM CATEGORIES').get().count;
  if (categoryCount === 0) {
    console.log('Seeding categories...');
    const insertCat = sqlite.prepare('INSERT INTO CATEGORIES (CATEGORY_NAME, DESCRIPTION) VALUES (?, ?)');
    insertCat.run('Electronics', 'Modern personal audio, accessories, and productivity tech gadgets.');
    insertCat.run('Home & Office', 'Thoughtfully engineered work desks, seating, and ergonomic fixtures.');
    insertCat.run('Audio & Wearables', 'Premium sound gear, smart wristwear, and noise-cancelling equipment.');
    insertCat.run('Travel & Accessories', 'Durable carry gear, weatherproof sleeves, and packable organizers.');
    insertCat.run('Desk Essentials', 'Precision peripherals, charging stands, and workspace mats.');
  }

  // 4. Check and seed PRODUCTS & INVENTORY if empty
  const productCount = sqlite.prepare('SELECT COUNT(*) as count FROM PRODUCTS').get().count;
  if (productCount === 0) {
    console.log('Seeding product catalog and inventory...');
    const initialProducts = [
      {
        categoryId: 1,
        name: 'AeroSound Pro Noise-Cancelling Headphones',
        desc: 'Over-ear studio sound with active hybrid noise cancellation, 40h battery, and plush memory foam cushions.',
        price: 249.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        stock: 45
      },
      {
        categoryId: 5,
        name: 'Studio Minimalist Mechanical Keyboard',
        desc: 'Compact 75% hot-swappable mechanical keyboard featuring tactile brown switches and seamless Bluetooth multi-device pairing.',
        price: 129.50,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        stock: 28
      },
      {
        categoryId: 1,
        name: 'OmniCharge MagFast Wireless Charging Stand',
        desc: 'Aluminum 3-in-1 fast charger capable of simultaneously powering your smartphone, smart watch, and earbuds.',
        price: 79.00,
        image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
        stock: 72
      },
      {
        categoryId: 3,
        name: 'Verve Smart Fitness Timepiece',
        desc: 'Sleek health companion offering precision heart rate analysis, SpO2 tracking, GPS navigation, and 7-day battery life.',
        price: 189.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        stock: 35
      },
      {
        categoryId: 5,
        name: 'ErgoGlide Precision Optical Mouse',
        desc: 'Sculpted ergonomic contour with silent clicking switches, infinite scroll wheel, and up to 4000 DPI sensitivity.',
        price: 64.95,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        stock: 60
      },
      {
        categoryId: 4,
        name: 'Voyager Weatherproof Everyday Backpack',
        desc: '24-liter water-repellent urban pack with dedicated 16-inch fleece laptop sleeve and concealed passport pocket.',
        price: 119.00,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        stock: 40
      },
      {
        categoryId: 2,
        name: 'Aura Ambient Glow Desk Lamp',
        desc: 'Modern architectural desk lamp featuring glare-free diffused illumination, stepless brightness touch slider, and USB-C port.',
        price: 89.00,
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80',
        stock: 22
      },
      {
        categoryId: 3,
        name: 'EchoPulse Waterproof Bluetooth Speaker',
        desc: 'Rugged IP67 dust and waterproof outdoor cylinder with 360-degree bass projection and 18-hour continuous runtime.',
        price: 99.95,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
        stock: 55
      },
      {
        categoryId: 5,
        name: 'Nordic Felt Desk Blotter & Organizer Mat',
        desc: 'Generous 90x40cm vegan wool felt surface offering wrist cushioning and anti-slip natural rubber underlay.',
        price: 34.50,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        stock: 80
      },
      {
        categoryId: 4,
        name: 'HydroShield Vacuum Insulated Flask 750ml',
        desc: 'Double-walled stainless steel bottle that keeps cold beverages chilled for 24h and hot drinks warm for 12h.',
        price: 38.00,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
        stock: 95
      },
      {
        categoryId: 2,
        name: 'BalancePro Active Lumbar Cushion',
        desc: 'Therapeutic memory foam back cushion designed to support posture and alleviate strain during prolonged desk sessions.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
        stock: 30
      },
      {
        categoryId: 1,
        name: 'Clarity 4K Ultra-HD Webcam',
        desc: 'Crystal clear video streaming sensor with dual noise-cancelling mics, HDR auto light balance, and sliding privacy shutter.',
        price: 109.00,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        stock: 48
      },
      {
        categoryId: 4,
        name: 'Apex Modular Cable & Tech Pouch',
        desc: 'Origami-style accessory organizer with elastic retaining loops for chargers, dongles, drives, and stylus pens.',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        stock: 65
      },
      {
        categoryId: 2,
        name: 'Solid Walnut Monitor Riser Shelf',
        desc: 'Hand-finished solid American walnut stand that raises your display to ergonomic eye level while storing your keyboard below.',
        price: 95.00,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        stock: 18
      },
      {
        categoryId: 3,
        name: 'PulseBuds Mini True Wireless Earphones',
        desc: 'Featherweight in-ear buds with custom-tuned dynamic drivers, transparent listening mode, and compact charging case.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        stock: 50
      },
      {
        categoryId: 5,
        name: 'HyperDrive 7-in-1 Aluminum USB-C Hub',
        desc: 'Universal port expansion offering 4K HDMI, 100W Power Delivery, SD/MicroSD readers, and 3x USB 3.1 ports.',
        price: 59.95,
        image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
        stock: 70
      }
    ];

    const insertProd = sqlite.prepare(`
      INSERT INTO PRODUCTS (CATEGORY_ID, PRODUCT_NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

    const insertInv = sqlite.prepare(`
      INSERT INTO INVENTORY (PRODUCT_ID, STOCK_QUANTITY, LAST_UPDATED)
      VALUES (?, ?, ?)
    `);

    for (const p of initialProducts) {
      const now = new Date().toISOString();
      const pRes = insertProd.run(p.categoryId, p.name, p.desc, p.price, p.image, now);
      insertInv.run(Number(pRes.lastInsertRowid), p.stock, now);
    }
  }

  // 5. Check and seed initial demo order for John Doe (USER_ID: 2) if empty
  const orderCount = sqlite.prepare('SELECT COUNT(*) as count FROM ORDERS').get().count;
  if (orderCount === 0) {
    const customer = sqlite.prepare('SELECT * FROM USERS WHERE EMAIL = ?').get('john.doe@example.com');
    if (customer) {
      const orderDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const orderRes = sqlite.prepare(`
        INSERT INTO ORDERS (USER_ID, ORDER_DATE, TOTAL_AMOUNT, ORDER_STATUS, SHIPPING_ADDRESS)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        customer.USER_ID,
        orderDate,
        379.49,
        'Delivered',
        customer.ADDRESS || '742 Evergreen Terrace, Springfield, OR'
      );

      const oId = Number(orderRes.lastInsertRowid);

      sqlite.prepare(`
        INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
        VALUES (?, ?, ?, ?)
      `).run(oId, 1, 1, 249.99);

      sqlite.prepare(`
        INSERT INTO ORDER_DETAILS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
        VALUES (?, ?, ?, ?)
      `).run(oId, 2, 1, 129.50);

      sqlite.prepare(`
        INSERT INTO PAYMENTS (ORDER_ID, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_DATE)
        VALUES (?, ?, ?, ?)
      `).run(oId, 'Card', 'Success', orderDate);
    }
  }

  // 6. Check and seed initial shopping cart item for John Doe if empty
  const cartCount = sqlite.prepare('SELECT COUNT(*) as count FROM SHOPPING_CART').get().count;
  if (cartCount === 0) {
    const customer = sqlite.prepare('SELECT * FROM USERS WHERE EMAIL = ?').get('john.doe@example.com');
    if (customer) {
      sqlite.prepare(`
        INSERT INTO SHOPPING_CART (USER_ID, PRODUCT_ID, QUANTITY, ADDED_AT)
        VALUES (?, ?, ?, ?)
      `).run(customer.USER_ID, 1, 1, new Date().toISOString());
    }
  }

  console.log('SmartCart SQLite database verified and ready.');
}

// Run init on module load
initDB();

/**
 * Compatible Table accessor object providing database operations
 */
export const db = {
  rawDb: sqlite,

  table(tableName) {
    const idCol = getPkCol(tableName);

    return {
      find(predicate) {
        const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
        if (!predicate) return rows;
        return rows.filter(predicate);
      },

      findById(id, customIdCol) {
        const pk = getPkCol(tableName, customIdCol);
        const row = sqlite.prepare(`SELECT * FROM ${tableName} WHERE ${pk} = ?`).get(Number(id));
        return row || null;
      },

      findOne(predicate) {
        const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
        return rows.find(predicate) || null;
      },

      insert(row) {
        const cols = Object.keys(row);
        const placeholders = cols.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`;
        const res = sqlite.prepare(sql).run(...Object.values(row));
        const insertedId = Number(res.lastInsertRowid);
        const pk = getPkCol(tableName);
        row[pk] = insertedId;
        return row;
      },

      update(id, updates, customIdCol) {
        const pk = getPkCol(tableName, customIdCol);
        const cols = Object.keys(updates);
        if (cols.length === 0) return this.findById(id, pk);
        const setClause = cols.map(c => `${c} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${pk} = ?`;
        sqlite.prepare(sql).run(...Object.values(updates), Number(id));
        return this.findById(id, pk);
      },

      delete(id, customIdCol) {
        const pk = getPkCol(tableName, customIdCol);
        const res = sqlite.prepare(`DELETE FROM ${tableName} WHERE ${pk} = ?`).run(Number(id));
        return res.changes > 0;
      },

      deleteWhere(predicate) {
        const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
        const targets = rows.filter(predicate);
        if (targets.length === 0) return false;
        const deleteStmt = sqlite.prepare(`DELETE FROM ${tableName} WHERE ${idCol} = ?`);
        for (const t of targets) {
          deleteStmt.run(t[idCol]);
        }
        return true;
      }
    };
  },

  // Helper for products with joined categories and inventory
  getProductsJoined({ search = '', category = null } = {}) {
    let query = `
      SELECT p.PRODUCT_ID, p.CATEGORY_ID, p.PRODUCT_NAME, p.DESCRIPTION, p.PRICE,
             p.IMAGE_URL, p.IS_ACTIVE, p.CREATED_AT,
             c.CATEGORY_NAME,
             COALESCE(i.STOCK_QUANTITY, 0) AS STOCK_QUANTITY
      FROM PRODUCTS p
      LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
      LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
      WHERE p.IS_ACTIVE = 1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (LOWER(p.PRODUCT_NAME) LIKE ? OR LOWER(p.DESCRIPTION) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    if (category) {
      if (/^\d+$/.test(category)) {
        query += ` AND p.CATEGORY_ID = ?`;
        params.push(Number(category));
      } else {
        query += ` AND LOWER(c.CATEGORY_NAME) = ?`;
        params.push(category.trim().toLowerCase());
      }
    }

    query += ` ORDER BY p.PRODUCT_ID ASC`;
    return sqlite.prepare(query).all(...params);
  },

  // Helper for single product by ID
  getProductById(id) {
    const query = `
      SELECT p.PRODUCT_ID, p.CATEGORY_ID, p.PRODUCT_NAME, p.DESCRIPTION, p.PRICE,
             p.IMAGE_URL, p.IS_ACTIVE, p.CREATED_AT,
             c.CATEGORY_NAME,
             COALESCE(i.STOCK_QUANTITY, 0) AS STOCK_QUANTITY
      FROM PRODUCTS p
      LEFT JOIN CATEGORIES c ON p.CATEGORY_ID = c.CATEGORY_ID
      LEFT JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
      WHERE p.PRODUCT_ID = ?
    `;
    const product = sqlite.prepare(query).get(Number(id));
    return product || null;
  }
};

export function saveToDisk() {
  // SQLite writes directly to disk in WAL mode
}

export default db;
