/**
 * SmartCart - Authentication & User Session Manager (vanilla JS)
 * Manages user login, registration form validation, JWT persistence,
 * top navbar user account menu, and mobile navigation toggles.
 */

import { api, AuthStorage, showToast } from './api.js';

export const AuthUI = {
  /**
   * Initializes navbar user state (Login button vs User dropdown)
   */
  initNavbar() {
    const authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) return;

    const user = AuthStorage.getUser();
    const token = AuthStorage.getToken();

    if (user && token) {
      // User is logged in: render user dropdown
      const firstName = user.FULL_NAME ? user.FULL_NAME.split(' ')[0] : 'User';
      const isAdmin = user.ROLE === 'admin';

      authContainer.innerHTML = `
        <div class="user-menu-container">
          <button id="user-menu-btn" class="user-btn" aria-haspopup="true" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${firstName}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="user-dropdown-menu" class="user-dropdown">
            <div class="dropdown-header">
              <div class="name">${user.FULL_NAME}</div>
              <div class="email">${user.EMAIL}</div>
              ${isAdmin ? '<span class="badge badge-warning" style="margin-top:4px;">Administrator</span>' : ''}
            </div>
            ${isAdmin ? `
              <a href="admin.html" class="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Admin Dashboard</span>
              </a>
            ` : ''}
            <a href="orders.html" class="dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>My Orders</span>
            </a>
            <a href="profile.html" class="dropdown-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Profile Settings</span>
            </a>
            <div style="height:1px; background:var(--border); margin:4px 0;"></div>
            <div id="btn-logout" class="dropdown-item danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      `;

      // Toggle dropdown click
      const userBtn = document.getElementById('user-menu-btn');
      const dropdown = document.getElementById('user-dropdown-menu');
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      // Close dropdown on outside click
      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });

      // Logout handler
      const logoutBtn = document.getElementById('btn-logout');
      logoutBtn.addEventListener('click', () => {
        AuthStorage.clear();
        showToast('You have been signed out successfully.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      });

    } else {
      // User is guest: render Sign In button
      authContainer.innerHTML = `
        <a href="login.html" class="btn btn-primary btn-sm">
          <span>Sign In</span>
        </a>
      `;
    }

    // Setup mobile drawer toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
    }
  },

  /**
   * Helper to set inline error on an input
   */
  setFieldError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  },

  /**
   * Helper to clear inline error
   */
  clearFieldError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  },

  /**
   * Sets up Registration Form handling & validation
   */
  initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('register-submit-btn');

    const nameError = document.getElementById('fullName-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirmPassword-error');

    // Clear errors on input
    [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', () => {
        const errEl = document.getElementById(`${inp.id}-error`);
        AuthUI.clearFieldError(inp, errEl);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasErrors = false;

      // 1. Full name validation
      const nameVal = nameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        AuthUI.setFieldError(nameInput, nameError, 'Please enter your full name (at least 2 characters).');
        hasErrors = true;
      }

      // 2. Email validation
      const emailVal = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailPattern.test(emailVal)) {
        AuthUI.setFieldError(emailInput, emailError, 'Please enter a valid email address (e.g. name@example.com).');
        hasErrors = true;
      }

      // 3. Password validation
      const passVal = passwordInput.value;
      if (!passVal || passVal.length < 6) {
        AuthUI.setFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.');
        hasErrors = true;
      }

      // 4. Confirm password validation
      const confirmVal = confirmPasswordInput.value;
      if (confirmVal !== passVal) {
        AuthUI.setFieldError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match.');
        hasErrors = true;
      }

      if (hasErrors) return;

      // Submit request to API
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> <span>Creating Account...</span>`;

      try {
        const response = await api.post('/register', {
          fullName: nameVal,
          email: emailVal,
          phone: phoneInput ? phoneInput.value.trim() : '',
          password: passVal,
          confirmPassword: confirmVal
        });

        showToast(response.message || 'Account registered! Please sign in.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html?registered=true';
        }, 1200);
      } catch (err) {
        showToast(err.message, 'error');
        if (err.message && err.message.toLowerCase().includes('email')) {
          AuthUI.setFieldError(emailInput, emailError, err.message);
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Account</span>`;
      }
    });
  },

  /**
   * Sets up Login Form handling & validation
   */
  initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Check query params if just registered
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      showToast('Registration successful! Please sign in with your credentials.', 'success');
    }

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit-btn');

    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    // Clear errors on input
    [emailInput, passwordInput].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', () => {
        const errEl = document.getElementById(`${inp.id}-error`);
        AuthUI.clearFieldError(inp, errEl);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasErrors = false;

      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        AuthUI.setFieldError(emailInput, emailError, 'Email address is required.');
        hasErrors = true;
      }

      const passVal = passwordInput.value;
      if (!passVal) {
        AuthUI.setFieldError(passwordInput, passwordError, 'Password is required.');
        hasErrors = true;
      }

      if (hasErrors) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> <span>Signing In...</span>`;

      try {
        const response = await api.post('/login', {
          email: emailVal,
          password: passVal
        });

        // Store JWT and user
        AuthStorage.setToken(response.token);
        AuthStorage.setUser(response.user);

        showToast(`Welcome back, ${response.user.FULL_NAME}!`, 'success');

        setTimeout(() => {
          // If admin, go to admin portal or index
          if (response.user.ROLE === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
      } catch (err) {
        showToast(err.message, 'error');
        AuthUI.setFieldError(passwordInput, passwordError, err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Sign In</span>`;
      }
    });
  }
};

// Auto-initialize navbar on DOM load
document.addEventListener('DOMContentLoaded', () => {
  AuthUI.initNavbar();
  AuthUI.initLoginForm();
  AuthUI.initRegisterForm();
});

window.AuthUI = AuthUI;
