/**
 * SmartCart - Admin Dashboard Controller (vanilla JS)
 * Handles role-verification, sidebar screen switching, overview stats,
 * Product CRUD & visibility toggle, Category CRUD, Inventory management,
 * Orders supervision & item details view, User role changing & deletion guards,
 * and Support Ticket management with status transitions and feedback inspection.
 */

import { api, AuthStorage, showToast, escapeHtml } from './api.js';

export const AdminController = {
  currentScreen: 'overview',
  categoriesCache: [],
  ordersCache: [],
  ticketsCache: [],

  async init() {
    // 1. Role verification: Redirect non-admins to home page
    const user = AuthStorage.getUser();
    if (!AuthStorage.isAuthenticated() || !user || user.ROLE !== 'admin') {
      showToast('Access restricted: Administrator role required. Redirecting to home...', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
      return;
    }

    // Set topbar and sidebar user info
    const emailEl = document.getElementById('topbar-user-email');
    const sidebarUserEl = document.getElementById('sidebar-admin-user');
    if (emailEl) emailEl.textContent = user.EMAIL;
    if (sidebarUserEl) sidebarUserEl.textContent = `Logged in: ${user.FULL_NAME || user.EMAIL}`;

    // 2. Bind sidebar navigation
    this.bindSidebarNav();

    // 3. Bind modals & forms
    this.bindModals();
    this.bindDatabaseEvents();

    // 4. Initial screen load
    await this.switchScreen('overview');
  },

  /**
   * Bind sidebar navigation buttons
   */
  bindSidebarNav() {
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const screen = btn.dataset.screen;
        this.switchScreen(screen);
      });
    });
  },

  /**
   * Switch between the 7 admin screens
   */
  async switchScreen(screenName) {
    this.currentScreen = screenName;

    // Update active nav button
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screenName);
    });

    // Update active screen panel
    document.querySelectorAll('.admin-screen').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`screen-${screenName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Update header title
    const titleMap = {
      overview: 'System Overview & Metrics',
      products: 'Products Catalog Management',
      categories: 'Product Categories',
      inventory: 'Inventory & Stock Supervision',
      orders: 'Store Orders Fulfillment',
      users: 'Registered Users Directory',
      tickets: 'Customer Support Desk',
      database: 'Database Schema & Query Viewer'
    };
    const titleEl = document.getElementById('screen-title');
    if (titleEl) titleEl.textContent = titleMap[screenName] || 'Admin Console';

    // Screen-specific data loaders
    try {
      if (screenName === 'overview') await this.loadOverview();
      else if (screenName === 'products') await this.loadProducts();
      else if (screenName === 'categories') await this.loadCategories();
      else if (screenName === 'inventory') await this.loadInventory();
      else if (screenName === 'orders') await this.loadOrders();
      else if (screenName === 'users') await this.loadUsers();
      else if (screenName === 'tickets') await this.loadTickets();
      else if (screenName === 'database') await this.loadDatabaseScreen();
    } catch (err) {
      console.error(`Error loading screen ${screenName}:`, err);
      showToast(err.message || 'Failed to load screen data.', 'error');
    }
  },

  /**
   * Modal dialog helpers
   */
  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('show');
  },

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('show');
  },

  bindModals() {
    // Backdrop click dismiss
    document.querySelectorAll('.admin-modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('show');
        }
      });
    });

    // Add Product button
    document.getElementById('btn-add-product')?.addEventListener('click', () => {
      this.populateCategorySelect('prod-category');
      document.getElementById('modal-product-title').textContent = 'Add New Product';
      document.getElementById('form-product').reset();
      document.getElementById('prod-id').value = '';
      document.getElementById('prod-is-active').checked = true;
      this.openModal('modal-product');
    });

    // Product form submission (Create or Update)
    document.getElementById('form-product')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('prod-id').value;
      const name = document.getElementById('prod-name').value.trim();
      const categoryId = Number(document.getElementById('prod-category').value);
      const price = parseFloat(document.getElementById('prod-price').value);
      const stock = parseInt(document.getElementById('prod-stock').value, 10);
      const imageUrl = document.getElementById('prod-image').value.trim();
      const description = document.getElementById('prod-description').value.trim();
      const isActive = document.getElementById('prod-is-active').checked;

      const saveBtn = document.getElementById('btn-save-product');
      saveBtn.disabled = true;

      try {
        if (id) {
          await api.put(`/admin/products/${id}`, {
            name, categoryId, price, stock, imageUrl, description, isActive
          });
          showToast(`Product #${id} updated successfully.`, 'success');
        } else {
          await api.post('/admin/products', {
            name, categoryId, price, stock, imageUrl, description
          });
          showToast('Product added successfully.', 'success');
        }
        this.closeModal('modal-product');
        await this.loadProducts();
      } catch (err) {
        showToast(err.message || 'Failed to save product.', 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });

    // Add Category button
    document.getElementById('btn-add-category')?.addEventListener('click', () => {
      document.getElementById('modal-category-title').textContent = 'Add Category';
      document.getElementById('form-category').reset();
      document.getElementById('cat-id').value = '';
      this.openModal('modal-category');
    });

    // Category form submission (Create or Update)
    document.getElementById('form-category')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('cat-id').value;
      const categoryName = document.getElementById('cat-name').value.trim();
      const description = document.getElementById('cat-description').value.trim();

      const saveBtn = document.getElementById('btn-save-category');
      saveBtn.disabled = true;

      try {
        if (id) {
          await api.put(`/admin/categories/${id}`, { categoryName, description });
          showToast(`Category #${id} updated.`, 'success');
        } else {
          await api.post('/admin/categories', { categoryName, description });
          showToast('Category created successfully.', 'success');
        }
        this.closeModal('modal-category');
        await this.loadCategories();
      } catch (err) {
        showToast(err.message || 'Failed to save category.', 'error');
      } finally {
        saveBtn.disabled = false;
      }
    });

    // Inventory Stock Form Submission
    document.getElementById('form-inventory')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pId = Number(document.getElementById('inv-prod-id').value);
      const stockQuantity = parseInt(document.getElementById('inv-stock-qty').value, 10);

      try {
        await api.put(`/admin/inventory/${pId}`, { stockQuantity });
        showToast(`Stock updated to ${stockQuantity} units.`, 'success');
        this.closeModal('modal-inventory');
        await this.loadInventory();
      } catch (err) {
        showToast(err.message || 'Failed to update stock.', 'error');
      }
    });

    // Refresh Buttons
    document.getElementById('btn-refresh-inventory')?.addEventListener('click', () => this.loadInventory());
    document.getElementById('btn-refresh-orders')?.addEventListener('click', () => this.loadOrders());
    document.getElementById('btn-refresh-tickets')?.addEventListener('click', () => this.loadTickets());
  },

  /**
   * 1. Overview Screen: GET /api/admin/stats
   */
  async loadOverview() {
    const res = await api.get('/admin/stats');
    const stats = res.stats || {};

    const elUsers = document.getElementById('stat-total-users');
    const elOrders = document.getElementById('stat-total-orders');
    const elRevenue = document.getElementById('stat-total-revenue');
    const elTickets = document.getElementById('stat-open-tickets');

    if (elUsers) elUsers.textContent = stats.totalUsers ?? 0;
    if (elOrders) elOrders.textContent = stats.totalOrders ?? 0;
    if (elRevenue) elRevenue.textContent = `$${Number(stats.totalRevenue || 0).toFixed(2)}`;
    if (elTickets) elTickets.textContent = stats.openTickets ?? 0;
  },

  /**
   * Helper to populate Category Selects across modals
   */
  async populateCategorySelect(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    if (this.categoriesCache.length === 0) {
      try {
        const res = await api.get('/admin/categories');
        this.categoriesCache = res.categories || [];
      } catch {
        this.categoriesCache = [];
      }
    }

    select.innerHTML = this.categoriesCache.map(c => `
      <option value="${c.CATEGORY_ID}" ${selectedId === c.CATEGORY_ID ? 'selected' : ''}>
        ${escapeHtml(c.CATEGORY_NAME)}
      </option>
    `).join('');
  },

  /**
   * 2. Products Screen
   */
  async loadProducts() {
    const tbody = document.getElementById('tbody-products');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    const res = await api.get('/admin/products');
    const products = res.products || [];

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px;" class="text-muted">No products found. Click "+ Add New Product" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr data-prod-id="${p.PRODUCT_ID}">
        <td style="font-weight:700;">#${p.PRODUCT_ID}</td>
        <td>
          <img src="${escapeHtml(p.IMAGE_URL)}" alt="${escapeHtml(p.PRODUCT_NAME)}" style="width:40px; height:40px; object-fit:cover; border-radius:var(--radius); border:1px solid var(--border);" />
        </td>
        <td>
          <div style="font-weight:600; color:var(--text);">${escapeHtml(p.PRODUCT_NAME)}</div>
          <div class="text-xs text-muted" style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${escapeHtml(p.DESCRIPTION || '')}
          </div>
        </td>
        <td><span class="badge" style="background:#F3F4F6;">${escapeHtml(p.CATEGORY_NAME || 'Uncategorized')}</span></td>
        <td style="font-weight:700;">$${Number(p.PRICE).toFixed(2)}</td>
        <td>
          ${p.STOCK_QUANTITY < 5 ? `<span class="badge badge-low-stock">${p.STOCK_QUANTITY} units</span>` : `${p.STOCK_QUANTITY} units`}
        </td>
        <td>
          <button type="button" class="toggle-btn ${p.IS_ACTIVE === 1 ? 'active' : 'inactive'} btn-toggle-active" data-id="${p.PRODUCT_ID}" data-active="${p.IS_ACTIVE}">
            ${p.IS_ACTIVE === 1 ? '● Active' : '○ Inactive'}
          </button>
        </td>
        <td style="text-align:right; white-space:nowrap;">
          <button type="button" class="btn btn-outline btn-sm btn-edit-product" data-id="${p.PRODUCT_ID}" style="margin-right:6px;">
            Edit
          </button>
          <button type="button" class="btn btn-outline btn-sm btn-delete-product" data-id="${p.PRODUCT_ID}" style="color:var(--danger); border-color:#FECACA;">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-toggle-active').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        btn.disabled = true;
        try {
          const toggleRes = await api.patch(`/admin/products/${id}/toggle`, {});
          showToast(toggleRes.message || 'Status updated.', 'success');
          await this.loadProducts();
        } catch (err) {
          showToast(err.message || 'Failed to toggle status.', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    tbody.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const p = products.find(item => item.PRODUCT_ID === id);
        if (!p) return;

        await this.populateCategorySelect('prod-category', p.CATEGORY_ID);
        document.getElementById('modal-product-title').textContent = `Edit Product #${p.PRODUCT_ID}`;
        document.getElementById('prod-id').value = p.PRODUCT_ID;
        document.getElementById('prod-name').value = p.PRODUCT_NAME;
        document.getElementById('prod-price').value = p.PRICE;
        document.getElementById('prod-stock').value = p.STOCK_QUANTITY;
        document.getElementById('prod-image').value = p.IMAGE_URL;
        document.getElementById('prod-description').value = p.DESCRIPTION || '';
        document.getElementById('prod-is-active').checked = p.IS_ACTIVE === 1;

        this.openModal('modal-product');
      });
    });

    tbody.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const p = products.find(item => item.PRODUCT_ID === id);
        if (!confirm(`Are you sure you want to permanently delete "${p ? p.PRODUCT_NAME : `Product #${id}`}"?`)) {
          return;
        }

        try {
          await api.delete(`/admin/products/${id}`);
          showToast('Product deleted.', 'success');
          await this.loadProducts();
        } catch (err) {
          showToast(err.message || 'Failed to delete product.', 'error');
        }
      });
    });
  },

  /**
   * 3. Categories Screen
   */
  async loadCategories() {
    const tbody = document.getElementById('tbody-categories');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    const res = await api.get('/admin/categories');
    const categories = res.categories || [];
    this.categoriesCache = categories;

    if (categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px;" class="text-muted">No categories found. Click "+ Add Category" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = categories.map(c => `
      <tr data-cat-id="${c.CATEGORY_ID}">
        <td style="font-weight:700;">#${c.CATEGORY_ID}</td>
        <td style="font-weight:600; color:var(--text);">${escapeHtml(c.CATEGORY_NAME)}</td>
        <td class="text-muted" style="max-width:320px;">${escapeHtml(c.DESCRIPTION || '—')}</td>
        <td>
          <span class="badge" style="background:#EEF2FF; color:#4338CA; font-weight:600;">
            ${c.PRODUCT_COUNT} product${c.PRODUCT_COUNT === 1 ? '' : 's'}
          </span>
        </td>
        <td style="text-align:right; white-space:nowrap;">
          <button type="button" class="btn btn-outline btn-sm btn-edit-category" data-id="${c.CATEGORY_ID}" style="margin-right:6px;">
            Edit
          </button>
          <button type="button" class="btn btn-outline btn-sm btn-delete-category" data-id="${c.CATEGORY_ID}" data-count="${c.PRODUCT_COUNT}" style="color:var(--danger); border-color:#FECACA;">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit-category').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const c = categories.find(item => item.CATEGORY_ID === id);
        if (!c) return;

        document.getElementById('modal-category-title').textContent = `Edit Category #${c.CATEGORY_ID}`;
        document.getElementById('cat-id').value = c.CATEGORY_ID;
        document.getElementById('cat-name').value = c.CATEGORY_NAME;
        document.getElementById('cat-description').value = c.DESCRIPTION || '';

        this.openModal('modal-category');
      });
    });

    tbody.querySelectorAll('.btn-delete-category').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const count = Number(btn.dataset.count);
        if (count > 0) {
          showToast(`Cannot delete category: ${count} product(s) currently belong to it.`, 'error');
          return;
        }

        if (!confirm(`Delete category #${id}? This action cannot be reversed.`)) return;

        try {
          await api.delete(`/admin/categories/${id}`);
          showToast('Category deleted successfully.', 'success');
          await this.loadCategories();
        } catch (err) {
          showToast(err.message || 'Failed to delete category.', 'error');
        }
      });
    });
  },

  /**
   * 4. Inventory Screen
   */
  async loadInventory() {
    const tbody = document.getElementById('tbody-inventory');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    const res = await api.get('/admin/inventory');
    const inventory = res.inventory || [];

    if (inventory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px;" class="text-muted">No inventory records.</td></tr>`;
      return;
    }

    tbody.innerHTML = inventory.map(item => {
      const isLow = item.STOCK_QUANTITY < 5;
      return `
        <tr data-inv-id="${item.PRODUCT_ID}">
          <td style="font-weight:700;">#${item.PRODUCT_ID}</td>
          <td>
            <img src="${escapeHtml(item.IMAGE_URL)}" alt="" style="width:36px; height:36px; object-fit:cover; border-radius:var(--radius); border:1px solid var(--border);" />
          </td>
          <td>
            <div style="font-weight:600; color:var(--text);">${escapeHtml(item.PRODUCT_NAME)}</div>
            <div class="text-xs text-muted">$${Number(item.PRICE).toFixed(2)}</div>
          </td>
          <td><span class="badge" style="background:#F3F4F6;">${escapeHtml(item.CATEGORY_NAME || 'General')}</span></td>
          <td style="font-weight:700; font-size:1rem;">
            ${item.STOCK_QUANTITY} units
          </td>
          <td>
            ${isLow
              ? `<span class="badge badge-low-stock">⚠️ Low (${item.STOCK_QUANTITY})</span>`
              : `<span class="badge badge-success">✓ Normal Stock</span>`
            }
          </td>
          <td style="text-align:right;">
            <button type="button" class="btn btn-outline btn-sm btn-edit-stock" data-id="${item.PRODUCT_ID}" data-name="${escapeHtml(item.PRODUCT_NAME)}" data-qty="${item.STOCK_QUANTITY}">
              Edit Stock
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-edit-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const name = btn.dataset.name;
        const qty = Number(btn.dataset.qty);

        document.getElementById('inv-prod-id').value = id;
        document.getElementById('inv-prod-name').textContent = `#${id} — ${name}`;
        document.getElementById('inv-stock-qty').value = qty;

        this.openModal('modal-inventory');
      });
    });
  },

  /**
   * 5. Orders Screen: Table with status changer dropdown & "View Items" modal
   */
  async loadOrders() {
    const tbody = document.getElementById('tbody-orders');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    const res = await api.get('/admin/orders');
    const orders = res.orders || [];
    this.ordersCache = orders;

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px;" class="text-muted">No orders placed yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const dateStr = o.ORDER_DATE ? new Date(o.ORDER_DATE).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      const statusLower = (o.ORDER_STATUS || 'placed').toLowerCase();

      return `
        <tr data-order-id="${o.ORDER_ID}">
          <td style="font-weight:700;">#SC-${o.ORDER_ID}</td>
          <td>
            <div style="font-weight:600;">${escapeHtml(o.FULL_NAME || 'Customer')}</div>
            <div class="text-xs text-muted">${escapeHtml(o.EMAIL || '')}</div>
          </td>
          <td class="text-sm text-muted">${dateStr}</td>
          <td style="font-weight:700;">$${Number(o.TOTAL_AMOUNT).toFixed(2)}</td>
          <td>
            <span class="badge badge-status-${statusLower}" style="font-weight:600;">
              ${escapeHtml(o.ORDER_STATUS)}
            </span>
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <div style="display:inline-flex; align-items:center; gap:8px;">
              <select class="form-control select-order-status" style="width:auto; padding:4px 8px; font-size:0.8125rem;">
                <option value="Placed" ${o.ORDER_STATUS === 'Placed' ? 'selected' : ''}>Placed</option>
                <option value="Shipped" ${o.ORDER_STATUS === 'Shipped' ? 'selected' : ''}>Shipped</option>
                <option value="Delivered" ${o.ORDER_STATUS === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${o.ORDER_STATUS === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
              <button type="button" class="btn btn-outline btn-sm btn-update-order-status" data-id="${o.ORDER_ID}">
                Update
              </button>
              <button type="button" class="btn btn-primary btn-sm btn-view-order-items" data-id="${o.ORDER_ID}">
                View Items
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Update Status
    tbody.querySelectorAll('.btn-update-order-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const row = btn.closest('tr');
        const status = row.querySelector('.select-order-status').value;

        btn.disabled = true;
        try {
          await api.put(`/admin/orders/${id}/status`, { status });
          showToast(`Order #${id} status changed to ${status}.`, 'success');
          await this.loadOrders();
        } catch (err) {
          showToast(err.message || 'Failed to update order status.', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Bind View Items
    tbody.querySelectorAll('.btn-view-order-items').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const order = this.ordersCache.find(o => o.ORDER_ID === id);
        if (!order) return;

        // Populate Modal
        document.getElementById('modal-order-title').textContent = `Order #SC-${order.ORDER_ID} Details`;
        document.getElementById('order-modal-customer').textContent = `${order.FULL_NAME || 'Customer'} (${order.EMAIL || ''})`;
        document.getElementById('order-modal-date').textContent = order.ORDER_DATE ? new Date(order.ORDER_DATE).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '—';
        document.getElementById('order-modal-address').textContent = order.SHIPPING_ADDRESS || 'Not specified';
        
        const statusEl = document.getElementById('order-modal-status');
        if (statusEl) {
          statusEl.textContent = order.ORDER_STATUS;
          statusEl.className = `badge badge-status-${(order.ORDER_STATUS || 'placed').toLowerCase()}`;
        }

        const itemsTbody = document.getElementById('order-modal-items-tbody');
        const items = order.items || [];
        if (items.length === 0) {
          itemsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:16px;">No item rows found for this order.</td></tr>`;
        } else {
          itemsTbody.innerHTML = items.map(item => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px 14px;">
                <div style="font-weight:600; color:var(--text);">${escapeHtml(item.PRODUCT_NAME || `Product #${item.PRODUCT_ID}`)}</div>
                <div class="text-xs text-muted">${escapeHtml(item.CATEGORY_NAME || '')}</div>
              </td>
              <td style="padding:10px 14px; text-align:right;">$${Number(item.PRICE).toFixed(2)}</td>
              <td style="padding:10px 14px; text-align:center; font-weight:600;">${item.QUANTITY}</td>
              <td style="padding:10px 14px; text-align:right; font-weight:600;">$${(Number(item.PRICE) * Number(item.QUANTITY)).toFixed(2)}</td>
            </tr>
          `).join('');
        }

        document.getElementById('order-modal-total').textContent = `$${Number(order.TOTAL_AMOUNT).toFixed(2)}`;

        this.openModal('modal-order-items');
      });
    });
  },

  /**
   * 6. Users Screen: Name, email, phone, role, joined date. Change role or delete user (cannot delete self).
   */
  async loadUsers() {
    const tbody = document.getElementById('tbody-users');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    const currentUser = AuthStorage.getUser() || {};
    const res = await api.get('/admin/users');
    const users = res.users || [];

    tbody.innerHTML = users.map(u => {
      const regDate = u.CREATED_AT ? new Date(u.CREATED_AT).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      const isSelf = currentUser.USER_ID === u.USER_ID;

      return `
        <tr data-user-id="${u.USER_ID}">
          <td style="font-weight:600; color:var(--text);">
            ${escapeHtml(u.FULL_NAME)}
            ${isSelf ? '<span class="badge" style="background:#E0E7FF; color:#3730A3; font-size:0.6875rem; margin-left:6px;">YOU</span>' : ''}
          </td>
          <td>${escapeHtml(u.EMAIL)}</td>
          <td class="text-sm text-muted">${escapeHtml(u.PHONE || '—')}</td>
          <td>
            <span class="badge ${u.ROLE === 'admin' ? 'badge-warning' : 'badge-success'}" style="font-weight:600;">
              ${(u.ROLE || 'customer').toUpperCase()}
            </span>
          </td>
          <td class="text-xs text-muted">${regDate}</td>
          <td style="text-align:right; white-space:nowrap;">
            <div style="display:inline-flex; align-items:center; gap:8px;">
              <!-- Role selector -->
              <select class="form-control select-user-role" style="width:auto; padding:4px 8px; font-size:0.8125rem;">
                <option value="customer" ${u.ROLE === 'customer' ? 'selected' : ''}>Customer</option>
                <option value="admin" ${u.ROLE === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
              <button type="button" class="btn btn-outline btn-sm btn-update-user-role" data-id="${u.USER_ID}">
                Update Role
              </button>

              <!-- Delete Button (Self-deletion guarded) -->
              ${isSelf ? `
                <button type="button" class="btn btn-outline btn-sm" disabled title="Admins cannot delete their own account." style="opacity:0.5; cursor:not-allowed;">
                  Delete
                </button>
              ` : `
                <button type="button" class="btn btn-outline btn-sm btn-delete-user" data-id="${u.USER_ID}" data-email="${escapeHtml(u.EMAIL)}" style="color:var(--danger); border-color:#FECACA;">
                  Delete
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Role Change
    tbody.querySelectorAll('.btn-update-user-role').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const row = btn.closest('tr');
        const role = row.querySelector('.select-user-role').value;

        btn.disabled = true;
        try {
          const roleRes = await api.put(`/admin/users/${id}/role`, { role });
          showToast(roleRes.message || 'User role updated.', 'success');
          await this.loadUsers();
        } catch (err) {
          showToast(err.message || 'Failed to update user role.', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Bind Delete User
    tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const email = btn.dataset.email;

        if (!confirm(`Are you sure you want to permanently delete user account ${email}? All their active carts and inquiries will be removed.`)) {
          return;
        }

        btn.disabled = true;
        try {
          const delRes = await api.delete(`/admin/users/${id}`);
          showToast(delRes.message || 'User deleted successfully.', 'success');
          await this.loadUsers();
        } catch (err) {
          showToast(err.message || 'Failed to delete user.', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });
  },

  /**
   * 7. Support Tickets Screen:
   * Table of all tickets (ticket ID, customer, order, issue type, priority, status, date).
   * Status changer (Open, In Progress, Resolved, Closed), view description modal, feedback rating for resolved.
   */
  async loadTickets() {
    const tbody = document.getElementById('tbody-tickets');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    const res = await api.get('/admin/tickets');
    const tickets = res.tickets || [];
    this.ticketsCache = tickets;

    if (tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px;" class="text-muted">No support tickets logged.</td></tr>`;
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      const priorityClass = t.PRIORITY === 'High' ? 'badge-danger' : t.PRIORITY === 'Medium' ? 'badge-warning' : 'badge-info';
      const statusLower = (t.STATUS || 'open').toLowerCase().replace(' ', '-');
      const dateStr = t.CREATED_AT ? new Date(t.CREATED_AT).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      
      let feedbackDisplay = '<span class="text-muted text-xs">—</span>';
      if (t.hasFeedback && t.FEEDBACK) {
        feedbackDisplay = `
          <div style="color:#D97706; font-size:0.8125rem; font-weight:700;">
            ${'★'.repeat(t.FEEDBACK.RATING)}${'☆'.repeat(5 - t.FEEDBACK.RATING)}
            <span class="text-xs" style="color:var(--text); margin-left:4px;">(${t.FEEDBACK.RATING}/5)</span>
          </div>
        `;
      } else if (t.STATUS === 'Resolved') {
        feedbackDisplay = '<span class="text-xs text-muted">Awaiting customer rating</span>';
      }

      return `
        <tr data-ticket-id="${t.TICKET_ID}">
          <td style="font-weight:700;">#TKT-${t.TICKET_ID}</td>
          <td>
            <div style="font-weight:600;">${escapeHtml(t.FULL_NAME || 'Customer')}</div>
            <div class="text-xs text-muted">${escapeHtml(t.EMAIL || '')}</div>
          </td>
          <td>
            ${t.ORDER_ID ? `<span style="font-weight:600;">#SC-${t.ORDER_ID}</span>` : '<span class="text-muted text-xs">General</span>'}
          </td>
          <td style="font-weight:500;">${escapeHtml(t.ISSUE_TYPE)}</td>
          <td><span class="badge ${priorityClass}">${escapeHtml(t.PRIORITY)}</span></td>
          <td>
            <span class="badge badge-status-${statusLower}" style="font-weight:600;">
              ${escapeHtml(t.STATUS)}
            </span>
          </td>
          <td class="text-xs text-muted">${dateStr}</td>
          <td>${feedbackDisplay}</td>
          <td style="text-align:right; white-space:nowrap;">
            <div style="display:inline-flex; align-items:center; gap:8px;">
              <select class="form-control select-admin-ticket-status" style="width:auto; padding:4px 8px; font-size:0.8125rem;">
                <option value="Open" ${t.STATUS === 'Open' ? 'selected' : ''}>Open</option>
                <option value="In Progress" ${t.STATUS === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Resolved" ${t.STATUS === 'Resolved' ? 'selected' : ''}>Resolved</option>
                <option value="Closed" ${t.STATUS === 'Closed' ? 'selected' : ''}>Closed</option>
              </select>
              <button type="button" class="btn btn-outline btn-sm btn-update-ticket" data-id="${t.TICKET_ID}">
                Update
              </button>
              <button type="button" class="btn btn-primary btn-sm btn-view-ticket" data-id="${t.TICKET_ID}">
                View
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Update Status
    tbody.querySelectorAll('.btn-update-ticket').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);
        const row = btn.closest('tr');
        const status = row.querySelector('.select-admin-ticket-status').value;

        btn.disabled = true;
        try {
          await api.put('/tickets/status', { ticketId: id, status });
          showToast(`Ticket #${id} status updated to ${status}.`, 'success');
          await this.loadTickets();
        } catch (err) {
          showToast(err.message || 'Failed to update ticket status.', 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Bind View Description Modal
    tbody.querySelectorAll('.btn-view-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const ticket = this.ticketsCache.find(t => t.TICKET_ID === id);
        if (!ticket) return;

        document.getElementById('modal-ticket-title').textContent = `Support Inquiry #TKT-${ticket.TICKET_ID}`;
        document.getElementById('ticket-modal-id').textContent = `#TKT-${ticket.TICKET_ID}`;
        document.getElementById('ticket-modal-customer').textContent = `${ticket.FULL_NAME || 'Customer'} (${ticket.EMAIL || ''})`;
        document.getElementById('ticket-modal-type').textContent = ticket.ISSUE_TYPE;
        document.getElementById('ticket-modal-order').textContent = ticket.ORDER_ID ? `Order #SC-${ticket.ORDER_ID}` : 'None (General Inquiry)';
        document.getElementById('ticket-modal-date').textContent = ticket.CREATED_AT ? new Date(ticket.CREATED_AT).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '—';

        // Badges
        const priorityEl = document.getElementById('ticket-modal-priority');
        if (priorityEl) {
          priorityEl.textContent = `${ticket.PRIORITY} Priority`;
          priorityEl.className = `badge ${ticket.PRIORITY === 'High' ? 'badge-danger' : ticket.PRIORITY === 'Medium' ? 'badge-warning' : 'badge-info'}`;
        }

        const statusEl = document.getElementById('ticket-modal-status');
        if (statusEl) {
          statusEl.textContent = ticket.STATUS;
          statusEl.className = `badge badge-status-${(ticket.STATUS || 'open').toLowerCase().replace(' ', '-')}`;
        }

        // Description
        document.getElementById('ticket-modal-description').textContent = ticket.DESCRIPTION || 'No description provided.';

        // Feedback
        const feedbackBox = document.getElementById('ticket-modal-feedback-box');
        if (ticket.hasFeedback && ticket.FEEDBACK) {
          feedbackBox.style.display = 'block';
          document.getElementById('ticket-modal-feedback-rating').textContent = `${'★'.repeat(ticket.FEEDBACK.RATING)}${'☆'.repeat(5 - ticket.FEEDBACK.RATING)} (${ticket.FEEDBACK.RATING}/5)`;
          document.getElementById('ticket-modal-feedback-comments').textContent = `"${ticket.FEEDBACK.COMMENTS || 'No written review'}"`;
        } else {
          feedbackBox.style.display = 'none';
        }

        this.openModal('modal-ticket-details');
      });
    });
  },

  /**
   * 8. Database Viewer Screen:
   * - Dropdown for 10 tables, scrollable view, column headers, row counts.
   * - PASSWORD column shows bcrypt hash.
   * - Run SQL box (SELECT statements only, reject others).
   * - Example query buttons.
   */
  bindDatabaseEvents() {
    // Table select change
    const tableSelect = document.getElementById('db-table-select');
    tableSelect?.addEventListener('change', () => {
      this.loadDatabaseTable(tableSelect.value);
    });

    // Refresh table button
    document.getElementById('btn-refresh-db-table')?.addEventListener('click', () => {
      if (tableSelect) this.loadDatabaseTable(tableSelect.value);
    });

    // Example query buttons
    document.querySelectorAll('.btn-example-sql').forEach(btn => {
      btn.addEventListener('click', () => {
        const sql = btn.dataset.sql;
        const textarea = document.getElementById('db-sql-input');
        if (textarea && sql) {
          textarea.value = sql;
          textarea.focus();
        }
      });
    });

    // Run SQL button
    document.getElementById('btn-run-sql')?.addEventListener('click', async () => {
      const textarea = document.getElementById('db-sql-input');
      const query = textarea ? textarea.value.trim() : '';

      if (!query) {
        showToast('Please enter a SQL query.', 'info');
        return;
      }

      const runBtn = document.getElementById('btn-run-sql');
      const statusDiv = document.getElementById('db-query-status');
      const resultsContainer = document.getElementById('db-query-results-container');
      const thead = document.getElementById('thead-query-results');
      const tbody = document.getElementById('tbody-query-results');
      const metaSpan = document.getElementById('db-query-result-meta');

      runBtn.disabled = true;
      const origHtml = runBtn.innerHTML;
      runBtn.innerHTML = `<span class="spinner" style="width:14px; height:14px; border-width:2px; display:inline-block; vertical-align:middle; margin-right:6px;"></span> Running...`;

      statusDiv.style.display = 'none';
      resultsContainer.style.display = 'none';

      try {
        const res = await api.post('/admin/db/query', { query });

        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `
          <div style="padding:12px 16px; background:#DCFCE7; border:1px solid #BBF7D0; border-radius:var(--radius); color:#15803D; font-size:0.875rem; display:flex; align-items:center; gap:8px;">
            <span>✓</span>
            <span><strong>Query Executed:</strong> Returned <strong>${res.rowCount}</strong> row(s) in <strong>${res.executionTimeMs}ms</strong>.</span>
          </div>
        `;

        if (metaSpan) {
          metaSpan.textContent = `Result Set (${res.rowCount} row${res.rowCount === 1 ? '' : 's'}) — ${res.executionTimeMs}ms`;
        }

        const columns = res.columns || [];
        const rows = res.rows || [];

        if (columns.length > 0) {
          thead.innerHTML = `<tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
          if (rows.length > 0) {
            tbody.innerHTML = rows.map(r => `
              <tr>
                ${columns.map(c => {
                  const val = r[c];
                  if (c === 'PASSWORD') {
                    return `<td><code style="font-size:0.75rem; color:#4B5563;">${escapeHtml(String(val || ''))}</code></td>`;
                  }
                  return `<td>${escapeHtml(String(val !== null && val !== undefined ? val : 'NULL'))}</td>`;
                }).join('')}
              </tr>
            `).join('');
          } else {
            tbody.innerHTML = `<tr><td colspan="${columns.length}" style="text-align:center; padding:16px;" class="text-muted">Query executed successfully, but returned 0 rows.</td></tr>`;
          }
        } else {
          thead.innerHTML = '';
          tbody.innerHTML = `<tr><td style="text-align:center; padding:16px;" class="text-muted">No columns returned.</td></tr>`;
        }

        resultsContainer.style.display = 'block';
      } catch (err) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `
          <div style="padding:12px 16px; background:#FEE2E2; border:1px solid #FECACA; border-radius:var(--radius); color:#B91C1C; font-size:0.875rem;">
            <strong>Query Rejected / Error:</strong> ${escapeHtml(err.message || 'Execution failed.')}
          </div>
        `;
        resultsContainer.style.display = 'none';
      } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = origHtml;
      }
    });
  },

  async loadDatabaseScreen() {
    const tableSelect = document.getElementById('db-table-select');
    if (!tableSelect) return;

    try {
      const res = await api.get('/admin/db/tables');
      const tables = res.tables || [];

      // Update options with row count
      tables.forEach(t => {
        const opt = tableSelect.querySelector(`option[value="${t.name}"]`);
        if (opt) {
          opt.textContent = `${t.name} (${t.rowCount} rows)`;
        }
      });

      const currentTable = tableSelect.value || 'USERS';
      await this.loadDatabaseTable(currentTable);
    } catch (err) {
      console.error('Failed to load database tables metadata:', err);
    }
  },

  async loadDatabaseTable(tableName) {
    const thead = document.getElementById('thead-db-columns');
    const tbody = document.getElementById('tbody-db-rows');
    const badge = document.getElementById('db-table-count-badge');
    const summary = document.getElementById('db-table-summary');
    if (!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = `<tr><td style="text-align:center; padding:32px;"><span class="spinner"></span></td></tr>`;

    try {
      const res = await api.get(`/admin/db/table/${tableName}`);
      const columns = res.columns || [];
      const rows = res.rows || [];

      if (badge) badge.textContent = `${res.rowCount} row${res.rowCount === 1 ? '' : 's'}`;
      if (summary) summary.textContent = `Showing all ${res.rowCount} record(s) from table ${res.table}.`;

      if (columns.length === 0) {
        tbody.innerHTML = `<tr><td style="text-align:center; padding:24px;" class="text-muted">Table ${escapeHtml(tableName)} has no columns or records.</td></tr>`;
        return;
      }

      thead.innerHTML = columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');

      if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${columns.length}" style="text-align:center; padding:24px;" class="text-muted">Table is currently empty (0 rows).</td></tr>`;
        return;
      }

      tbody.innerHTML = rows.map(r => `
        <tr>
          ${columns.map(c => {
            const val = r[c];
            if (c === 'PASSWORD') {
              return `
                <td style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:0.75rem; color:#4B5563; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(String(val || ''))}">
                  <code>${escapeHtml(String(val || ''))}</code>
                </td>
              `;
            }
            return `<td>${escapeHtml(String(val !== null && val !== undefined ? val : 'NULL'))}</td>`;
          }).join('')}
        </tr>
      `).join('');

    } catch (err) {
      console.error(`Failed to load table ${tableName}:`, err);
      tbody.innerHTML = `<tr><td style="text-align:center; padding:24px; color:var(--danger)">Error loading table: ${escapeHtml(err.message)}</td></tr>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminController.init();
});

window.AdminController = AdminController;
