/**
 * SmartCart - Order History Controller (vanilla JS)
 * Loads real user orders from GET /api/orders.
 * Provides expandable order items, payment details, and color-coded status badges.
 */

import { api, AuthStorage, showToast, escapeHtml } from './api.js';
import { CartManager } from './cart.js';

export const OrdersController = {
  /**
   * Helper to return color-coded badge HTML based on order status
   */
  renderStatusBadge(status) {
    const s = (status || 'Placed').trim();
    let badgeClass = 'badge-status-placed';

    if (s.toLowerCase() === 'shipped') {
      badgeClass = 'badge-status-shipped';
    } else if (s.toLowerCase() === 'delivered') {
      badgeClass = 'badge-status-delivered';
    } else if (s.toLowerCase() === 'cancelled') {
      badgeClass = 'badge-status-cancelled';
    } else {
      badgeClass = 'badge-status-placed';
    }

    return `<span class="badge ${badgeClass}" style="font-weight:600; padding:4px 10px; border-radius:12px;">${escapeHtml(s)}</span>`;
  },

  /**
   * Formats ISO timestamp to human friendly string
   */
  formatDate(isoString) {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  },

  async init() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    // 1. Auth check
    if (!AuthStorage.isAuthenticated()) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>Please Sign In</h3>
          <p>You need to be logged in to view your order history and tracking updates.</p>
          <a href="login.html?redirect=orders.html" class="btn btn-primary">Sign In</a>
        </div>
      `;
      return;
    }

    // 2. Fetch orders from GET /api/orders
    try {
      const res = await api.get('/orders');
      const orders = res.orders || [];

      // 3. Friendly Empty State if no orders exist
      if (orders.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h3>No Orders Placed Yet</h3>
            <p>You haven't placed any purchases yet. When you complete checkout, your order milestones and item receipts will appear here.</p>
            <a href="products.html" class="btn btn-primary" style="margin-top: 12px;">Start Shopping</a>
          </div>
        `;
        return;
      }

      // 4. Render clean list of orders with expandable item accordions
      container.innerHTML = orders.map((order, idx) => {
        const orderIdDisplay = `#SC-${order.ORDER_ID}`;
        const dateDisplay = this.formatDate(order.ORDER_DATE);
        const totalDisplay = `$${Number(order.TOTAL_AMOUNT).toFixed(2)}`;
        const statusBadge = this.renderStatusBadge(order.ORDER_STATUS);

        const details = order.DETAILS || [];
        const payment = order.PAYMENT || {};
        const paymentMethod = payment.PAYMENT_METHOD || 'Card';
        const paymentStatus = payment.PAYMENT_STATUS || 'Completed';

        // Auto-expand the first (most recent) order
        const isInitiallyExpanded = idx === 0;

        return `
          <div class="order-card ${isInitiallyExpanded ? 'expanded' : ''}" data-order-id="${order.ORDER_ID}">
            <!-- Clickable Header Row -->
            <div class="order-card-header" role="button" aria-expanded="${isInitiallyExpanded}" tabindex="0">
              <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                <div>
                  <div class="text-xs text-muted font-medium">ORDER ID</div>
                  <div style="font-weight:700; font-size:1rem; color:var(--text);">${orderIdDisplay}</div>
                </div>

                <div style="border-left:1px solid var(--border); padding-left:16px;">
                  <div class="text-xs text-muted font-medium">DATE PLACED</div>
                  <div class="font-semibold text-sm">${dateDisplay}</div>
                </div>

                <div style="border-left:1px solid var(--border); padding-left:16px;">
                  <div class="text-xs text-muted font-medium">TOTAL</div>
                  <div class="font-semibold text-sm" style="color:var(--text);">${totalDisplay}</div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:16px; margin-left:auto;">
                <div>${statusBadge}</div>
                
                <div style="display:flex; align-items:center; gap:6px; font-size:0.875rem; color:var(--primary); font-weight:500;">
                  <span class="toggle-text">${isInitiallyExpanded ? 'Hide Items' : 'View Items'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="order-card-chevron">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Expandable Body Content -->
            <div class="order-card-body">
              <!-- Payment & Shipping Metadata Box -->
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius); padding:16px; margin-bottom:20px; font-size:0.875rem;">
                <div>
                  <span class="text-muted text-xs font-medium">PAYMENT METHOD</span>
                  <div style="font-weight:600; margin-top:2px;">
                    ${escapeHtml(paymentMethod)}
                  </div>
                </div>

                <div>
                  <span class="text-muted text-xs font-medium">PAYMENT STATUS</span>
                  <div style="margin-top:2px;">
                    <span class="badge ${paymentStatus === 'Success' ? 'badge-success' : 'badge-warning'}" style="font-size:0.75rem;">
                      ${escapeHtml(paymentStatus)}
                    </span>
                  </div>
                </div>

                ${order.SHIPPING_ADDRESS ? `
                  <div style="grid-column: 1 / -1;">
                    <span class="text-muted text-xs font-medium">SHIPPING ADDRESS</span>
                    <div style="margin-top:2px; font-weight:500;">
                      ${escapeHtml(order.SHIPPING_ADDRESS)}
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- Line Items Breakdown -->
              <h4 style="font-size:0.9375rem; margin-bottom:12px; font-weight:600;">Items in this order (${details.length})</h4>
              
              <div style="display:flex; flex-direction:column; gap:16px; border-top:1px solid var(--border); padding-top:16px;">
                ${details.map(d => `
                  <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
                    <a href="product-details.html?id=${d.PRODUCT_ID}">
                      <img src="${escapeHtml(d.IMAGE_URL)}" alt="${escapeHtml(d.PRODUCT_NAME)}" style="width:64px; height:64px; object-fit:cover; border-radius:var(--radius); border:1px solid var(--border);" />
                    </a>

                    <div style="flex:1; min-width:180px;">
                      <h5 style="font-size:0.9375rem; margin-bottom:4px;">
                        <a href="product-details.html?id=${d.PRODUCT_ID}" style="color:var(--text); font-weight:600;">
                          ${escapeHtml(d.PRODUCT_NAME)}
                        </a>
                      </h5>
                      <div class="text-xs text-muted">
                        Quantity: <strong>${d.QUANTITY}</strong> &bull; Purchase Price: <strong>$${Number(d.PRICE).toFixed(2)}</strong> each
                      </div>
                    </div>

                    <div style="text-align:right; min-width:80px;">
                      <div class="text-xs text-muted">Line Total</div>
                      <div style="font-weight:700; font-size:1rem;">$${(Number(d.PRICE) * Number(d.QUANTITY)).toFixed(2)}</div>
                    </div>

                    <button type="button" class="btn btn-outline btn-sm btn-reorder" data-id="${d.PRODUCT_ID}" style="margin-left:8px;">
                      <span>Buy Again</span>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // 5. Bind Accordion Expand/Collapse Event Listeners
      container.querySelectorAll('.order-card-header').forEach(header => {
        const toggle = () => {
          const card = header.closest('.order-card');
          const isExpanded = card.classList.toggle('expanded');
          header.setAttribute('aria-expanded', isExpanded);
          const toggleText = header.querySelector('.toggle-text');
          if (toggleText) {
            toggleText.textContent = isExpanded ? 'Hide Items' : 'View Items';
          }
        };

        header.addEventListener('click', toggle);
        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });

      // 6. Bind "Buy Again" button handlers
      container.querySelectorAll('.btn-reorder').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const pId = Number(btn.dataset.id);
          btn.disabled = true;
          const orig = btn.innerHTML;
          btn.innerHTML = `<span class="spinner" style="width:14px; height:14px; border-width:2px; display:inline-block;"></span>`;
          try {
            await CartManager.addItem(pId, 1);
            showToast('Added product to your bag. Directing to cart...', 'success');
            setTimeout(() => {
              window.location.href = 'cart.html';
            }, 600);
          } catch (err) {
            btn.disabled = false;
            btn.innerHTML = orig;
          }
        });
      });

    } catch (err) {
      console.error('Failed to load orders:', err);
      container.innerHTML = `
        <div class="empty-state">
          <p style="color:var(--danger)">Failed to load your order history. Please verify your connection.</p>
          <button class="btn btn-outline btn-sm" onclick="window.location.reload()" style="margin-top:12px;">Try Again</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  OrdersController.init();
});

window.OrdersController = OrdersController;
