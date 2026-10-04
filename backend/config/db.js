/**
 * SmartCart - Database Layer & Seed Engine
 * Provides persistent relational storage for SmartCart tables.
 * Persists to backend/data/smartcart.db (JSON storage fallback compliant with SQL schema).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and file path
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'smartcart.db');

// In-memory relational tables state
let tables = {
  USERS: [],
  CATEGORIES: [],
  PRODUCTS: [],
  INVENTORY: [],
  SHOPPING_CART: [],
  ORDERS: [],
  ORDER_DETAILS: [],
  PAYMENTS: [],
  SUPPORT_TICKETS: [],
  SUPPORT_FEEDBACK: []
};

// Sequences for auto-incrementing Primary Keys
let sequences = {
  USERS: 1,
  CATEGORIES: 1,
  PRODUCTS: 1,
  INVENTORY: 1,
  SHOPPING_CART: 1,
  ORDERS: 1,
  ORDER_DETAILS: 1,
  PAYMENTS: 1,
  SUPPORT_TICKETS: 1,
  SUPPORT_FEEDBACK: 1
};

/**
 * Ensures data directory exists
 */
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Saves current table state to persistent disk file
 */
export function saveToDisk() {
  try {
    ensureDir();
    const state = {
      tables,
      sequences,
      savedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to persist database state:', error);
  }
}

/**
 * Seeds initial tables if empty
 */
function seedDatabase() {
  console.log('Seeding initial SmartCart database with 5 categories, 16 products, and default users...');

  // 1. Seed 5 Categories
  const categoriesData = [
    {
      CATEGORY_NAME: 'Electronics',
      DESCRIPTION: 'Laptops, audio equipment, smartphones, and smart workspace gadgets'
    },
    {
      CATEGORY_NAME: 'Fashion & Apparel',
      DESCRIPTION: 'Minimalist wardrobe staples, organic cotton wear, and everyday essentials'
    },
    {
      CATEGORY_NAME: 'Home & Living',
      DESCRIPTION: 'Clean aesthetic furniture, ambient lighting, and functional home decor'
    },
    {
      CATEGORY_NAME: 'Books & Stationery',
      DESCRIPTION: 'Curated architectural books, premium fountain pens, and minimal notebooks'
    },
    {
      CATEGORY_NAME: 'Health & Wellness',
      DESCRIPTION: 'Clean skincare formulations, wellness tools, and daily mindfulness essentials'
    }
  ];

  categoriesData.forEach(cat => {
    const id = sequences.CATEGORIES++;
    tables.CATEGORIES.push({
      CATEGORY_ID: id,
      CATEGORY_NAME: cat.CATEGORY_NAME,
      DESCRIPTION: cat.DESCRIPTION
    });
  });

  // 2. Seed Users (1 Admin: admin@smartcart.com / Admin@123, 1 Customer: john.doe@example.com / Customer@123)
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);
  const customerPasswordHash = bcrypt.hashSync('Customer@123', salt);

  tables.USERS.push({
    USER_ID: sequences.USERS++,
    FULL_NAME: 'System Administrator',
    EMAIL: 'admin@smartcart.com',
    PASSWORD: adminPasswordHash,
    PHONE: '+1 (555) 019-9000',
    ADDRESS: '100 Tech Hub Boulevard, Suite 500, San Francisco, CA 94107',
    ROLE: 'admin',
    CREATED_AT: new Date().toISOString()
  });

  tables.USERS.push({
    USER_ID: sequences.USERS++,
    FULL_NAME: 'John Doe',
    EMAIL: 'john.doe@example.com',
    PASSWORD: customerPasswordHash,
    PHONE: '+1 (555) 014-2345',
    ADDRESS: '742 Evergreen Terrace, Springfield, OR 97477',
    ROLE: 'customer',
    CREATED_AT: new Date().toISOString()
  });

  // 3. Seed 16 Products across 5 categories with high quality minimal imagery
  const productsData = [
    // Electronics (Cat 1)
    {
      catId: 1,
      name: 'AeroSound Pro Noise-Cancelling Headphones',
      desc: 'Precision-engineered over-ear wireless headphones with active noise cancellation, 40-hour battery life, and plush memory foam ear cushions.',
      price: 249.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      stock: 45
    },
    {
      catId: 1,
      name: 'Studio Minimalist Mechanical Keyboard',
      desc: 'Compact 75% layout keyboard with custom lubricated linear switches, solid aluminum chassis, and subtle warm white backlighting.',
      price: 129.50,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      stock: 28
    },
    {
      catId: 1,
      name: 'OmniCharge MagFast Wireless Charging Stand',
      desc: 'Machined aluminum multi-device charging hub with magnetic fast charging for smartphones, earbuds, and smartwatch concurrently.',
      price: 79.00,
      image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
      stock: 72
    },
    {
      catId: 1,
      name: 'Verve Smart Fitness Timepiece',
      desc: 'Ultra-slim titanium smartwatch with continuous biometric tracking, sapphire crystal glass, and 7-day battery endurance.',
      price: 199.00,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      stock: 30
    },

    // Fashion & Apparel (Cat 2)
    {
      catId: 2,
      name: 'Heritage Organic Heavyweight Tee',
      desc: 'Crafted from 100% GOTS-certified combed organic cotton with a relaxed boxy cut, reinforced crew neckline, and pre-shrunk finish.',
      price: 38.00,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      stock: 120
    },
    {
      catId: 2,
      name: 'Komorebi Wool Blend Overcoat',
      desc: 'Tailored minimalist overcoat woven from recycled Italian wool blend with hidden horn button placket and satin lining.',
      price: 289.00,
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      stock: 18
    },
    {
      catId: 2,
      name: 'Everyday Canvas Commuter Backpack',
      desc: 'Weatherproof waxed canvas rucksack with 16-inch padded laptop sleeve, quick-access passport pocket, and vegetable-tanned leather trim.',
      price: 115.00,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      stock: 50
    },

    // Home & Living (Cat 3)
    {
      catId: 3,
      name: 'Lumina Architectural Desk Lamp',
      desc: 'Minimal cantilever desk lamp with touch-dimmable warm LED, rotating counterbalanced arm, and brass joints.',
      price: 89.00,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      stock: 35
    },
    {
      catId: 3,
      name: 'Artisan Ceramic Pour-Over Dripper Set',
      desc: 'Handcrafted stoneware pour-over dripper with matched 600ml server pitcher, finished in matte speckled sand glaze.',
      price: 48.00,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      stock: 65
    },
    {
      catId: 3,
      name: 'Nordic Solid Oak Floating Shelf',
      desc: 'Sustainably harvested white oak wall shelf with hidden heavy-duty bracket mounting, natural beeswax wax finish.',
      price: 64.00,
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
      stock: 22
    },
    {
      catId: 3,
      name: 'Aroma Ultrasonic Ceramic Diffuser',
      desc: 'Sculptural stone-matte essential oil diffuser with whisper-quiet ultrasonic atomization and gentle warm glow night mode.',
      price: 55.00,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      stock: 40
    },

    // Books & Stationery (Cat 4)
    {
      catId: 4,
      name: 'Grid & Form: Modern Graphic Architecture',
      desc: 'Hardcover monograph detailing structural grid systems, modernist typography, and rational visual systems worldwide.',
      price: 42.00,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      stock: 85
    },
    {
      catId: 4,
      name: 'Brass Precision Fountain Pen',
      desc: 'Solid untreated brass writing instrument with German Schmidt iridium nib, balanced weight, and developing natural patina.',
      price: 68.00,
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
      stock: 60
    },
    {
      catId: 4,
      name: 'Smyth-Sewn Hardcover Grid Journal',
      desc: 'Lays flat 180 degrees. 240 numbered pages of 120gsm fountain-pen friendly Japanese paper with subtle 5mm dot grid.',
      price: 26.00,
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop&q=80',
      stock: 150
    },

    // Health & Wellness (Cat 5)
    {
      catId: 5,
      name: 'Botanical Restorative Facial Oil',
      desc: 'Cold-pressed jojoba, rosehip seed, and blue tansy blend to soothe skin barrier and restore deep hydration overnight.',
      price: 52.00,
      image: 'https://images.unsplash.com/photo-1608248597359-5613532b43b6?w=800&auto=format&fit=crop&q=80',
      stock: 90
    },
    {
      catId: 5,
      name: 'Cast Iron Kettlebell 16kg',
      desc: 'Single-pour gravity cast iron bell with smooth color-coded handle, flat machined base, and chip-resistant powder coating.',
      price: 74.00,
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      stock: 14
    }
  ];

  productsData.forEach(p => {
    const prodId = sequences.PRODUCTS++;
    tables.PRODUCTS.push({
      PRODUCT_ID: prodId,
      CATEGORY_ID: p.catId,
      PRODUCT_NAME: p.name,
      DESCRIPTION: p.desc,
      PRICE: p.price,
      IMAGE_URL: p.image,
      IS_ACTIVE: 1,
      CREATED_AT: new Date().toISOString()
    });

    const invId = sequences.INVENTORY++;
    tables.INVENTORY.push({
      INVENTORY_ID: invId,
      PRODUCT_ID: prodId,
      STOCK_QUANTITY: p.stock,
      LAST_UPDATED: new Date().toISOString()
    });
  });

  // 4. Seed initial shopping cart
  tables.SHOPPING_CART.push({
    CART_ID: sequences.SHOPPING_CART++,
    USER_ID: 2,
    PRODUCT_ID: 1,
    QUANTITY: 1,
    ADDED_AT: new Date().toISOString()
  });

  // 5. Seed sample order
  const orderId = sequences.ORDERS++;
  tables.ORDERS.push({
    ORDER_ID: orderId,
    USER_ID: 2,
    ORDER_DATE: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    TOTAL_AMOUNT: 379.49,
    ORDER_STATUS: 'Delivered'
  });

  tables.ORDER_DETAILS.push({
    DETAIL_ID: sequences.ORDER_DETAILS++,
    ORDER_ID: orderId,
    PRODUCT_ID: 1,
    QUANTITY: 1,
    PRICE: 249.99
  });

  tables.ORDER_DETAILS.push({
    DETAIL_ID: sequences.ORDER_DETAILS++,
    ORDER_ID: orderId,
    PRODUCT_ID: 2,
    QUANTITY: 1,
    PRICE: 129.50
  });

  tables.PAYMENTS.push({
    PAYMENT_ID: sequences.PAYMENTS++,
    ORDER_ID: orderId,
    PAYMENT_METHOD: 'Credit Card',
    PAYMENT_STATUS: 'Completed',
    PAYMENT_DATE: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  });

  // 6. Seed sample support ticket and feedback
  const ticketId = sequences.SUPPORT_TICKETS++;
  tables.SUPPORT_TICKETS.push({
    TICKET_ID: ticketId,
    USER_ID: 2,
    ORDER_ID: orderId,
    ISSUE_TYPE: 'Delivery Tracking',
    DESCRIPTION: 'Checking delivery confirmation details for the mechanical keyboard and headphones package.',
    STATUS: 'Resolved',
    PRIORITY: 'Medium',
    CREATED_AT: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  });

  tables.SUPPORT_FEEDBACK.push({
    FEEDBACK_ID: sequences.SUPPORT_FEEDBACK++,
    TICKET_ID: ticketId,
    RATING: 5,
    COMMENTS: 'Quick resolution and accurate courier update. Very satisfied!'
  });

  saveToDisk();
}

/**
 * Initializes database from disk or runs seeding
 */
export function initDB() {
  ensureDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.tables && parsed.tables.USERS && parsed.tables.USERS.length > 0) {
        tables = parsed.tables;
        sequences = parsed.sequences || sequences;
        console.log(`Loaded SmartCart database from disk: ${tables.PRODUCTS.length} products loaded.`);
        return;
      }
    } catch (e) {
      console.warn('Could not read existing database file, re-seeding...', e);
    }
  }

  seedDatabase();
}

/**
 * Table accessor object with relational helpers
 */
export const db = {
  // Direct table access
  tables,

  // Table queries
  table(tableName) {
    if (!tables[tableName]) {
      throw new Error(`Table ${tableName} does not exist in schema.`);
    }
    return {
      find(predicate) {
        if (!predicate) return [...tables[tableName]];
        return tables[tableName].filter(predicate);
      },
      findById(id, idColumnName) {
        const idCol = idColumnName || `${tableName.replace(/S$/, '')}_ID`;
        return tables[tableName].find(row => row[idCol] === Number(id));
      },
      findOne(predicate) {
        return tables[tableName].find(predicate) || null;
      },
      insert(row) {
        const idCol = `${tableName.replace(/S$/, '')}_ID`;
        if (!row[idCol]) {
          row[idCol] = sequences[tableName]++;
        }
        tables[tableName].push(row);
        saveToDisk();
        return row;
      },
      update(id, updates, idColumnName) {
        const idCol = idColumnName || `${tableName.replace(/S$/, '')}_ID`;
        const index = tables[tableName].findIndex(row => row[idCol] === Number(id));
        if (index === -1) return null;
        tables[tableName][index] = { ...tables[tableName][index], ...updates };
        saveToDisk();
        return tables[tableName][index];
      },
      delete(id, idColumnName) {
        const idCol = idColumnName || `${tableName.replace(/S$/, '')}_ID`;
        const initialLen = tables[tableName].length;
        tables[tableName] = tables[tableName].filter(row => row[idCol] !== Number(id));
        const deleted = tables[tableName].length < initialLen;
        if (deleted) saveToDisk();
        return deleted;
      }
    };
  },

  // Helper for products with joined categories and inventory
  getProductsJoined({ search = '', category = null } = {}) {
    let result = tables.PRODUCTS.filter(p => p.IS_ACTIVE === 1).map(p => {
      const categoryObj = tables.CATEGORIES.find(c => c.CATEGORY_ID === p.CATEGORY_ID);
      const inventoryObj = tables.INVENTORY.find(i => i.PRODUCT_ID === p.PRODUCT_ID);
      const stock = inventoryObj ? inventoryObj.STOCK_QUANTITY : 0;

      return {
        PRODUCT_ID: p.PRODUCT_ID,
        CATEGORY_ID: p.CATEGORY_ID,
        CATEGORY_NAME: categoryObj ? categoryObj.CATEGORY_NAME : 'General',
        PRODUCT_NAME: p.PRODUCT_NAME,
        DESCRIPTION: p.DESCRIPTION,
        PRICE: Number(p.PRICE),
        IMAGE_URL: p.IMAGE_URL,
        STOCK_QUANTITY: stock,
        IS_ACTIVE: p.IS_ACTIVE,
        CREATED_AT: p.CREATED_AT
      };
    });

    if (category) {
      const catNum = Number(category);
      result = result.filter(p => p.CATEGORY_ID === catNum);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.PRODUCT_NAME.toLowerCase().includes(q) ||
        p.DESCRIPTION.toLowerCase().includes(q) ||
        p.CATEGORY_NAME.toLowerCase().includes(q)
      );
    }

    return result;
  },

  getProductById(id) {
    const p = tables.PRODUCTS.find(item => item.PRODUCT_ID === Number(id) && item.IS_ACTIVE === 1);
    if (!p) return null;

    const categoryObj = tables.CATEGORIES.find(c => c.CATEGORY_ID === p.CATEGORY_ID);
    const inventoryObj = tables.INVENTORY.find(i => i.PRODUCT_ID === p.PRODUCT_ID);
    const stock = inventoryObj ? inventoryObj.STOCK_QUANTITY : 0;

    return {
      PRODUCT_ID: p.PRODUCT_ID,
      CATEGORY_ID: p.CATEGORY_ID,
      CATEGORY_NAME: categoryObj ? categoryObj.CATEGORY_NAME : 'General',
      PRODUCT_NAME: p.PRODUCT_NAME,
      DESCRIPTION: p.DESCRIPTION,
      PRICE: Number(p.PRICE),
      IMAGE_URL: p.IMAGE_URL,
      STOCK_QUANTITY: stock,
      IS_ACTIVE: p.IS_ACTIVE,
      CREATED_AT: p.CREATED_AT
    };
  }
};

// Initialize database on import
initDB();

export default db;
