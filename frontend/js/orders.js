/**
 * SmartCart - Orders Controller (vanilla JS)
 * Displays user order history and order tracking placeholders.
 */

import { AuthStorage } from './api.js';

export const OrdersController = {
  init() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    const user = AuthStorage.getUser();
    if (!user) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Please Sign In</h3>
          <p>You need to be logged in to view your order history and tracking updates.</p>
          <a href="login.html" class="btn btn-primary">Sign In</a>
        </div>
      `;
      return;
    }

    // Default sample order display for demonstration
    container.innerHTML = `
      <div class="card" style="padding: 24px; margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:16px; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <div>
            <div class="text-xs text-muted">ORDER PLACED</div>
            <div class="font-semibold text-sm">October 2, 2026</div>
          </div>
          <div>
            <div class="text-xs text-muted">TOTAL AMOUNT</div>
            <div class="font-semibold text-sm">$379.49</div>
          </div>
          <div>
            <div class="text-xs text-muted">SHIP TO</div>
            <div class="font-semibold text-sm">${user.FULL_NAME || 'Customer'}</div>
          </div>
          <div>
            <div class="text-xs text-muted">ORDER #SC-101</div>
            <span class="badge badge-success">Delivered</span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80" alt="Headphones" style="width:64px; height:64px; object-fit:cover; border-radius:var(--radius);" />
            <div style="flex:1;">
              <h4 style="font-size:0.9375rem;">AeroSound Pro Noise-Cancelling Headphones</h4>
              <p class="text-xs text-muted">Qty: 1 &bull; $249.99</p>
            </div>
            <a href="product-details.html?id=1" class="btn btn-outline btn-sm">Buy Again</a>
          </div>

          <div style="display:flex; gap:16px; align-items:center;">
            <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80" alt="Keyboard" style="width:64px; height:64px; object-fit:cover; border-radius:var(--radius);" />
            <div style="flex:1;">
              <h4 style="font-size:0.9375rem;">Studio Minimalist Mechanical Keyboard</h4>
              <p class="text-xs text-muted">Qty: 1 &bull; $129.50</p>
            </div>
            <a href="product-details.html?id=2" class="btn btn-outline btn-sm">Buy Again</a>
          </div>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  OrdersController.init();
});
