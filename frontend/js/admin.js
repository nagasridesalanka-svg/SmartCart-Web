/**
 * SmartCart - Admin Dashboard Controller (vanilla JS)
 * Admin portal statistics, inventory manager, and role verification.
 */

import { AuthStorage, showToast, api } from './api.js';

export const AdminController = {
  async init() {
    const container = document.getElementById('admin-dashboard-container');
    if (!container) return;

    const user = AuthStorage.getUser();
    if (!user || user.ROLE !== 'admin') {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3>Administrative Access Required</h3>
          <p>You must be signed in with an administrator account to access this management dashboard.</p>
          <a href="login.html" class="btn btn-primary">Sign In as Admin</a>
        </div>
      `;
      return;
    }

    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);

      const products = prodsRes.products || [];
      const categories = catsRes.categories || [];
      const totalInventory = products.reduce((acc, p) => acc + (p.STOCK_QUANTITY || 0), 0);

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; flex-wrap:wrap; gap:16px;">
          <div>
            <h1>Admin Operations</h1>
            <p>System metrics, product catalogue, and inventory supervision.</p>
          </div>
          <span class="badge badge-warning" style="font-size:0.875rem; padding:6px 12px;">Logged in as: ${user.EMAIL}</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:36px;">
          <div class="card" style="padding:24px;">
            <div class="text-xs text-muted font-semibold">TOTAL PRODUCTS</div>
            <div style="font-size:2rem; font-weight:700; margin-top:8px;">${products.length}</div>
          </div>
          <div class="card" style="padding:24px;">
            <div class="text-xs text-muted font-semibold">ACTIVE CATEGORIES</div>
            <div style="font-size:2rem; font-weight:700; margin-top:8px;">${categories.length}</div>
          </div>
          <div class="card" style="padding:24px;">
            <div class="text-xs text-muted font-semibold">TOTAL STOCK ON HAND</div>
            <div style="font-size:2rem; font-weight:700; margin-top:8px;">${totalInventory}</div>
          </div>
          <div class="card" style="padding:24px;">
            <div class="text-xs text-muted font-semibold">ACTIVE ORDERS</div>
            <div style="font-size:2rem; font-weight:700; margin-top:8px;">1</div>
          </div>
        </div>

        <div class="card" style="padding:24px; overflow-x:auto;">
          <h3 style="margin-bottom:16px;">Inventory & Stock Levels</h3>
          <table style="width:100%; border-collapse:collapse; font-size:0.875rem;">
            <thead>
              <tr style="border-bottom:2px solid var(--border); text-align:left; color:var(--muted);">
                <th style="padding:10px;">ID</th>
                <th style="padding:10px;">Product Name</th>
                <th style="padding:10px;">Category</th>
                <th style="padding:10px;">Price</th>
                <th style="padding:10px;">Stock</th>
                <th style="padding:10px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:12px 10px; font-weight:600;">#${p.PRODUCT_ID}</td>
                  <td style="padding:12px 10px;">
                    <a href="product-details.html?id=${p.PRODUCT_ID}" style="color:var(--primary); font-weight:500;">
                      ${p.PRODUCT_NAME}
                    </a>
                  </td>
                  <td style="padding:12px 10px; color:var(--muted);">${p.CATEGORY_NAME}</td>
                  <td style="padding:12px 10px; font-weight:600;">$${Number(p.PRICE).toFixed(2)}</td>
                  <td style="padding:12px 10px; font-weight:600;">${p.STOCK_QUANTITY} units</td>
                  <td style="padding:12px 10px;">
                    ${p.STOCK_QUANTITY > 0 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Out of Stock</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      showToast('Error loading admin dashboard stats.', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminController.init();
});
