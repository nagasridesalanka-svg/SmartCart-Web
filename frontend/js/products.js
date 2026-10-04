/**
 * SmartCart - Products & Catalog Controller (vanilla JS)
 * Handles catalog browsing, search & category filtering, rendering of product cards,
 * star ratings, stock badges, and the single product details view.
 */

import { api, showToast, escapeHtml } from './api.js';
import { CartManager } from './cart.js';

// SVG Star icon generator
export function renderStars(rating = 4.8) {
  const fullStars = Math.floor(rating);
  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += `<svg viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    } else {
      starsHtml += `<svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
  }
  return starsHtml;
}

// Stock Badge Generator
export function renderStockBadge(stockQuantity) {
  if (stockQuantity <= 0) {
    return `<span class="badge badge-danger">Out of Stock</span>`;
  } else if (stockQuantity < 20) {
    return `<span class="badge badge-warning">Only ${stockQuantity} left</span>`;
  } else {
    return `<span class="badge badge-success">In Stock</span>`;
  }
}

// Single Product Card HTML template
export function createProductCardHtml(product) {
  const priceFormatted = `$${Number(product.PRICE).toFixed(2)}`;
  // Deterministic fake review count for realistic feel
  const reviewCount = 20 + ((product.PRODUCT_ID * 17) % 85);
  const ratingScore = (4.4 + ((product.PRODUCT_ID * 3) % 6) * 0.1).toFixed(1);

  return `
    <div class="product-card" data-product-id="${product.PRODUCT_ID}">
      <div class="product-image-wrap">
        <a href="product-details.html?id=${product.PRODUCT_ID}">
          <img src="${escapeHtml(product.IMAGE_URL)}" alt="${escapeHtml(product.PRODUCT_NAME)}" loading="lazy" />
        </a>
        <span class="product-category-tag">${escapeHtml(product.CATEGORY_NAME || 'General')}</span>
      </div>

      <div class="product-body">
        <h3 class="product-title">
          <a href="product-details.html?id=${product.PRODUCT_ID}">${escapeHtml(product.PRODUCT_NAME)}</a>
        </h3>

        <div class="product-rating">
          <div class="stars">${renderStars(Number(ratingScore))}</div>
          <span class="rating-count">(${reviewCount})</span>
          <div style="margin-left:auto;">${renderStockBadge(product.STOCK_QUANTITY)}</div>
        </div>

        <div class="product-footer">
          <div class="product-price">${priceFormatted}</div>
          <button class="btn btn-outline btn-sm btn-add-cart" 
                  data-id="${product.PRODUCT_ID}"
                  ${product.STOCK_QUANTITY <= 0 ? 'disabled' : ''}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export const ProductsController = {
  productsCache: [],
  categoriesCache: [],

  /**
   * Initializes Home page (Categories + Featured grid)
   */
  async initHomePage() {
    const featuredGrid = document.getElementById('featured-products-grid');
    const categoriesGrid = document.getElementById('home-categories-grid');

    if (!featuredGrid && !categoriesGrid) return;

    try {
      // 1. Fetch categories
      const catRes = await api.get('/categories');
      this.categoriesCache = catRes.categories || [];

      if (categoriesGrid) {
        const catIcons = [
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>`,
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`
        ];

        categoriesGrid.innerHTML = this.categoriesCache.map((cat, idx) => `
          <a href="products.html?category=${cat.CATEGORY_ID}" class="category-card">
            <div class="category-icon">${catIcons[idx % catIcons.length]}</div>
            <div class="category-name">${escapeHtml(cat.CATEGORY_NAME)}</div>
            <p class="text-xs text-muted" style="margin-top:4px;">Browse items</p>
          </a>
        `).join('');
      }

      // 2. Fetch featured products (first 8 items)
      if (featuredGrid) {
        const prodRes = await api.get('/products');
        const products = prodRes.products || [];
        this.productsCache = products;

        const featured = products.slice(0, 8);
        featuredGrid.innerHTML = featured.map(p => createProductCardHtml(p)).join('');

        this.bindAddToCartButtons(featuredGrid);
      }
    } catch (err) {
      console.error('Home page load failed:', err);
      showToast('Could not load catalog showcase.', 'error');
    }
  },

  /**
   * Initializes Products Catalog page
   */
  async initProductsPage() {
    const productsGrid = document.getElementById('products-catalog-grid');
    const categoryTabsContainer = document.getElementById('category-filter-tabs');
    const countDisplay = document.getElementById('catalog-results-count');
    const searchInput = document.getElementById('catalog-search-input');
    const sortSelect = document.getElementById('catalog-sort-select');

    if (!productsGrid) return;

    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    let activeCategory = urlParams.get('category') || '';
    let searchQuery = urlParams.get('search') || '';

    if (searchInput && searchQuery) {
      searchInput.value = searchQuery;
    }

    try {
      // 1. Fetch categories for tab bar
      const catRes = await api.get('/categories');
      this.categoriesCache = catRes.categories || [];

      if (categoryTabsContainer) {
        categoryTabsContainer.innerHTML = `
          <button class="category-tab ${!activeCategory ? 'active' : ''}" data-cat="">All Products</button>
          ${this.categoriesCache.map(cat => `
            <button class="category-tab ${activeCategory == cat.CATEGORY_ID ? 'active' : ''}" data-cat="${cat.CATEGORY_ID}">
              ${escapeHtml(cat.CATEGORY_NAME)}
            </button>
          `).join('')}
        `;

        categoryTabsContainer.querySelectorAll('.category-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            categoryTabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.cat;
            loadProducts();
          });
        });
      }

      // Function to load and render filtered products
      const loadProducts = async () => {
        productsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px;">
            <span class="spinner" style="border-top-color: var(--primary); width: 32px; height: 32px; border-width: 3px;"></span>
            <p style="margin-top: 12px;">Loading catalog...</p>
          </div>
        `;

        try {
          const res = await api.get('/products', {
            category: activeCategory,
            search: searchQuery
          });

          let products = res.products || [];
          this.productsCache = products;

          // Apply sorting
          if (sortSelect) {
            const sortMode = sortSelect.value;
            if (sortMode === 'price-low') {
              products.sort((a, b) => a.PRICE - b.PRICE);
            } else if (sortMode === 'price-high') {
              products.sort((a, b) => b.PRICE - a.PRICE);
            } else if (sortMode === 'name') {
              products.sort((a, b) => a.PRODUCT_NAME.localeCompare(b.PRODUCT_NAME));
            }
          }

          if (countDisplay) {
            countDisplay.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
          }

          if (products.length === 0) {
            productsGrid.innerHTML = `
              <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No matching products</h3>
                <p>We couldn't find any items matching your search criteria. Try a different term or clear filters.</p>
                <button id="btn-reset-filters" class="btn btn-outline btn-sm">Reset Filters</button>
              </div>
            `;

            const resetBtn = document.getElementById('btn-reset-filters');
            if (resetBtn) {
              resetBtn.addEventListener('click', () => {
                activeCategory = '';
                searchQuery = '';
                if (searchInput) searchInput.value = '';
                if (categoryTabsContainer) {
                  categoryTabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                  categoryTabsContainer.querySelector('.category-tab').classList.add('active');
                }
                loadProducts();
              });
            }
            return;
          }

          productsGrid.innerHTML = products.map(p => createProductCardHtml(p)).join('');
          this.bindAddToCartButtons(productsGrid);
        } catch (err) {
          productsGrid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p style="color:var(--danger)">Error loading products.</p></div>`;
        }
      };

      // Search input listener with debounce
      let debounceTimeout;
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            loadProducts();
          }, 300);
        });
      }

      // Sort change listener
      if (sortSelect) {
        sortSelect.addEventListener('change', () => {
          loadProducts();
        });
      }

      // Initial load
      loadProducts();

    } catch (err) {
      console.error('Catalog initialization failed:', err);
    }
  },

  /**
   * Initializes Product Details page
   */
  async initProductDetailsPage() {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Product Not Found</h3>
          <p>No product specified. Return to the shop catalog to explore our collection.</p>
          <a href="products.html" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }

    try {
      const res = await api.get(`/products/${productId}`);
      const product = res.product;

      document.title = `${product.PRODUCT_NAME} — SmartCart`;

      const priceFormatted = `$${Number(product.PRICE).toFixed(2)}`;
      const inStock = product.STOCK_QUANTITY > 0;

      container.innerHTML = `
        <div class="product-details-wrap">
          <div class="product-gallery">
            <div class="product-main-img">
              <img src="${escapeHtml(product.IMAGE_URL)}" alt="${escapeHtml(product.PRODUCT_NAME)}" />
            </div>
          </div>

          <div class="product-info-panel">
            <nav class="breadcrumbs" aria-label="Breadcrumbs">
              <a href="index.html">Home</a>
              <span>/</span>
              <a href="products.html">Products</a>
              <span>/</span>
              <a href="products.html?category=${product.CATEGORY_ID}">${escapeHtml(product.CATEGORY_NAME)}</a>
            </nav>

            <h1 class="product-details-title">${escapeHtml(product.PRODUCT_NAME)}</h1>

            <div class="product-rating" style="margin-bottom:16px;">
              <div class="stars">${renderStars(4.9)}</div>
              <span class="rating-count">(48 customer reviews)</span>
              <div style="margin-left: 16px;">${renderStockBadge(product.STOCK_QUANTITY)}</div>
            </div>

            <div class="product-details-price">${priceFormatted}</div>

            <div class="product-description-box">
              <p>${escapeHtml(product.DESCRIPTION)}</p>
            </div>

            <div class="stock-status-info" style="margin-bottom:20px; font-size:0.875rem;">
              <strong>Availability:</strong> 
              ${inStock ? `<span style="color:var(--success); font-weight:600;">${product.STOCK_QUANTITY} units ready to ship</span>` : '<span style="color:var(--danger); font-weight:600;">Currently backordered</span>'}
            </div>

            <div class="action-row">
              <div class="quantity-picker">
                <button type="button" class="qty-btn" id="qty-decrement" aria-label="Decrease quantity">&minus;</button>
                <input type="number" id="detail-qty" class="qty-input" value="1" min="1" max="${product.STOCK_QUANTITY || 1}" readonly />
                <button type="button" class="qty-btn" id="qty-increment" aria-label="Increase quantity">&plus;</button>
              </div>

              <button id="btn-details-add" class="btn btn-primary btn-lg" style="flex:1;" ${!inStock ? 'disabled' : ''}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Add to Cart</span>
              </button>
            </div>

            <div class="trust-features">
              <div class="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span>Free express courier dispatch</span>
              </div>
              <div class="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>2-Year manufacturer guarantee</span>
              </div>
              <div class="trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Hassle-free 30-day returns</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Setup Quantity Buttons
      const qtyInput = document.getElementById('detail-qty');
      const decBtn = document.getElementById('qty-decrement');
      const incBtn = document.getElementById('qty-increment');
      const addBtn = document.getElementById('btn-details-add');

      decBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) {
          qtyInput.value = val - 1;
        }
      });

      incBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < product.STOCK_QUANTITY) {
          qtyInput.value = val + 1;
        }
      });

      addBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        CartManager.addItem(product, qty);
      });

    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Error Loading Product</h3>
          <p>${escapeHtml(err.message || 'The requested product could not be loaded.')}</p>
          <a href="products.html" class="btn btn-outline">Back to Catalog</a>
        </div>
      `;
    }
  },

  /**
   * Helper to bind Add to Cart click events on grid cards
   */
  bindAddToCartButtons(container) {
    const buttons = container.querySelectorAll('.btn-add-cart');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const product = this.productsCache.find(p => p.PRODUCT_ID === id);
        if (product) {
          CartManager.addItem(product, 1);
        }
      });
    });
  }
};

// Auto-run appropriate controller on page load
document.addEventListener('DOMContentLoaded', () => {
  ProductsController.initHomePage();
  ProductsController.initProductsPage();
  ProductsController.initProductDetailsPage();
});

window.ProductsController = ProductsController;
