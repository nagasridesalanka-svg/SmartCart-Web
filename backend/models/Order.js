/**
 * SmartCart - Order Model
 * Maps to ORDERS, ORDER_DETAILS, and PAYMENTS tables.
 * Handles atomic order placement and transaction simulation.
 */

import db, { saveToDisk } from '../config/db.js';
import Product from './Product.js';

const Order = {
  /**
   * Finds orders placed by a specific user with their order details & payment info
   */
  findByUserId(userId) {
    const uId = Number(userId);
    const orders = db.table('ORDERS').find(o => o.USER_ID === uId);

    return orders.sort((a, b) => new Date(b.ORDER_DATE) - new Date(a.ORDER_DATE)).map(order => {
      const details = db.table('ORDER_DETAILS').find(d => d.ORDER_ID === order.ORDER_ID).map(detail => {
        const prod = Product.findById(detail.PRODUCT_ID);
        return {
          DETAIL_ID: detail.DETAIL_ID,
          PRODUCT_ID: detail.PRODUCT_ID,
          QUANTITY: detail.QUANTITY,
          PRICE: detail.PRICE,
          PRODUCT_NAME: prod ? prod.PRODUCT_NAME : 'Product',
          IMAGE_URL: prod ? prod.IMAGE_URL : ''
        };
      });

      const payment = db.table('PAYMENTS').findOne(p => p.ORDER_ID === order.ORDER_ID);

      return {
        ...order,
        DETAILS: details,
        PAYMENT: payment || null
      };
    });
  },

  /**
   * Places an order atomically:
   * 1. Checks stock for every cart item.
   * 2. If any item has insufficient stock, aborts and changes nothing.
   * 3. Creates ORDERS row with status 'Placed'.
   * 4. Creates ORDER_DETAILS rows with price at purchase time.
   * 5. Creates PAYMENTS row (Success for Card and UPI, Pending for Cash on Delivery).
   * 6. Decrements INVENTORY stock.
   * 7. Clears user's SHOPPING_CART.
   */
  createOrder({ userId, shippingAddress, paymentMethod = 'Card' }) {
    const uId = Number(userId);

    // 1. Fetch user's cart items
    const cartItems = db.table('SHOPPING_CART').find(item => item.USER_ID === uId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Your cart is empty. Add products before placing an order.');
    }

    // 2. Validate stock for every item before making any modifications
    const validatedItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = Product.findById(item.PRODUCT_ID);
      if (!product) {
        throw new Error(`Product #${item.PRODUCT_ID} is no longer available.`);
      }

      const inventory = db.table('INVENTORY').findOne(inv => inv.PRODUCT_ID === item.PRODUCT_ID);
      const stock = inventory ? inventory.STOCK_QUANTITY : 0;

      if (stock < item.QUANTITY) {
        throw new Error(
          `Insufficient stock for "${product.PRODUCT_NAME}". Available: ${stock}, Requested: ${item.QUANTITY}.`
        );
      }

      const itemTotal = Number(product.PRICE) * Number(item.QUANTITY);
      subtotal += itemTotal;

      validatedItems.push({
        product,
        inventory,
        quantity: item.QUANTITY,
        price: Number(product.PRICE)
      });
    }

    // Calculate delivery shipping
    const shipping = subtotal > 150 ? 0 : 9.99;
    const totalAmount = Number((subtotal + shipping).toFixed(2));

    // Normalize payment method
    let cleanPaymentMethod = 'Card';
    if (/upi/i.test(paymentMethod)) {
      cleanPaymentMethod = 'UPI';
    } else if (/cash|cod/i.test(paymentMethod)) {
      cleanPaymentMethod = 'Cash on Delivery';
    } else {
      cleanPaymentMethod = 'Card';
    }

    const paymentStatus = cleanPaymentMethod === 'Cash on Delivery' ? 'Pending' : 'Success';

    // 3. Create the ORDERS row (status Placed)
    const order = db.table('ORDERS').insert({
      USER_ID: uId,
      ORDER_DATE: new Date().toISOString(),
      TOTAL_AMOUNT: totalAmount,
      ORDER_STATUS: 'Placed',
      SHIPPING_ADDRESS: (shippingAddress || '').trim()
    });

    // 4. Create ORDER_DETAILS rows and deduct INVENTORY stock
    const createdDetails = [];
    for (const vi of validatedItems) {
      const detail = db.table('ORDER_DETAILS').insert({
        ORDER_ID: order.ORDER_ID,
        PRODUCT_ID: vi.product.PRODUCT_ID,
        QUANTITY: vi.quantity,
        PRICE: vi.price
      });

      createdDetails.push({
        ...detail,
        PRODUCT_NAME: vi.product.PRODUCT_NAME,
        IMAGE_URL: vi.product.IMAGE_URL
      });

      // Deduct stock
      db.table('INVENTORY').update(vi.inventory.INVENTORY_ID, {
        STOCK_QUANTITY: vi.inventory.STOCK_QUANTITY - vi.quantity,
        LAST_UPDATED: new Date().toISOString()
      }, 'INVENTORY_ID');
    }

    // 5. Create PAYMENTS row
    const payment = db.table('PAYMENTS').insert({
      ORDER_ID: order.ORDER_ID,
      PAYMENT_METHOD: cleanPaymentMethod,
      PAYMENT_STATUS: paymentStatus,
      PAYMENT_DATE: new Date().toISOString()
    });

    // 6. Clear user's SHOPPING_CART
    db.table('SHOPPING_CART').deleteWhere(item => item.USER_ID === uId);

    return {
      orderId: order.ORDER_ID,
      orderDate: order.ORDER_DATE,
      totalAmount,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      orderStatus: order.ORDER_STATUS,
      shippingAddress: order.SHIPPING_ADDRESS,
      paymentMethod: cleanPaymentMethod,
      paymentStatus,
      items: createdDetails
    };
  }
};

export default Order;
