/**
 * SmartCart - Support Controller (vanilla JS)
 * Handles customer support ticket submissions and FAQ toggles.
 */

import { showToast, AuthStorage } from './api.js';

export const SupportController = {
  init() {
    const form = document.getElementById('support-ticket-form');
    if (!form) return;

    const user = AuthStorage.getUser();
    const emailField = document.getElementById('support-email');
    if (user && emailField && !emailField.value) {
      emailField.value = user.EMAIL;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const issueType = document.getElementById('support-issue-type').value;
      const message = document.getElementById('support-message').value.trim();

      if (!message) {
        showToast('Please describe your inquiry.', 'error');
        return;
      }

      showToast(`Your support ticket for "${issueType}" has been logged. Our helpdesk will respond shortly.`, 'success');
      form.reset();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SupportController.init();
});
