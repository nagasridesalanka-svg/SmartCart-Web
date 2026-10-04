/**
 * SmartCart - Support Controller (vanilla JS)
 * Manages 4 tabs: Create Ticket, Track Tickets, FAQ Accordion, and Feedback Rating.
 */

import { api, AuthStorage, showToast, escapeHtml } from './api.js';

export const SupportController = {
  activeTab: 'create',
  preselectedTicketIdForFeedback: null,

  async init() {
    this.bindTabs();
    this.bindFAQ();
    this.setupPriorityWatcher();

    // Check URL query parameters for tab navigation (e.g. ?tab=track)
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab && ['create', 'track', 'faq', 'feedback'].includes(initialTab)) {
      this.switchTab(initialTab);
    } else {
      this.switchTab('create');
    }

    if (AuthStorage.isAuthenticated()) {
      await this.loadUserOrdersForTicket();
      await this.loadTrackTickets();
      await this.loadFeedbackTab();
    } else {
      this.renderUnauthenticatedStates();
    }

    this.bindForms();
  },

  /**
   * Tab switching logic
   */
  bindTabs() {
    const tabBtns = document.querySelectorAll('.support-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabName, extraData = null) {
    this.activeTab = tabName;
    if (extraData && extraData.ticketId) {
      this.preselectedTicketIdForFeedback = extraData.ticketId;
    }

    // Update active tab buttons
    document.querySelectorAll('.support-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    // Update active tab panels
    document.querySelectorAll('.support-tab-panel').forEach(p => {
      p.classList.remove('active');
    });

    const activePanel = document.getElementById(`tab-panel-${tabName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Refresh content when tab activated
    if (AuthStorage.isAuthenticated()) {
      if (tabName === 'track') {
        this.loadTrackTickets();
      } else if (tabName === 'feedback') {
        this.loadFeedbackTab();
      }
    }
  },

  /**
   * FAQ Accordion bindings
   */
  bindFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      q?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Toggle current item
        item.classList.toggle('open', !isOpen);
      });
    });
  },

  /**
   * Watch issue type dropdown and update priority badge preview live
   */
  setupPriorityWatcher() {
    const issueSelect = document.getElementById('ticket-issue-type');
    const badgeContainer = document.getElementById('priority-badge-display');
    const noteEl = document.getElementById('priority-note');
    if (!issueSelect || !badgeContainer || !noteEl) return;

    const updatePriority = () => {
      const val = issueSelect.value;
      if (val === 'Payment Issue' || val === 'Damaged Product') {
        badgeContainer.innerHTML = `<span class="badge badge-priority-high" style="font-weight:600;">High Priority</span>`;
        noteEl.textContent = 'High urgency queue: payment anomalies and damaged arrivals receive expedited attention.';
      } else if (val === 'Refund Request') {
        badgeContainer.innerHTML = `<span class="badge badge-priority-medium" style="font-weight:600;">Medium Priority</span>`;
        noteEl.textContent = 'Medium urgency queue: return inspection and refund review.';
      } else {
        badgeContainer.innerHTML = `<span class="badge badge-priority-low" style="font-weight:600;">Low Priority</span>`;
        noteEl.textContent = 'Standard urgency queue for tracking questions and general queries.';
      }
    };

    issueSelect.addEventListener('change', updatePriority);
    updatePriority();
  },

  /**
   * Load user's orders for order dropdown in Create Ticket tab
   */
  async loadUserOrdersForTicket() {
    const orderSelect = document.getElementById('ticket-order-id');
    if (!orderSelect) return;

    try {
      const res = await api.get('/orders');
      const orders = res.orders || [];

      orderSelect.innerHTML = `<option value="">General inquiry (No specific order)</option>`;
      orders.forEach(o => {
        const dateStr = o.ORDER_DATE ? new Date(o.ORDER_DATE).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const opt = document.createElement('option');
        opt.value = o.ORDER_ID;
        opt.textContent = `Order #SC-${o.ORDER_ID} — ${dateStr} ($${Number(o.TOTAL_AMOUNT).toFixed(2)})`;
        orderSelect.appendChild(opt);
      });
    } catch (e) {
      console.warn('Could not load orders for ticket form:', e);
    }
  },

  /**
   * Form submit bindings
   */
  bindForms() {
    // 1. Create Ticket Form
    const createForm = document.getElementById('create-ticket-form');
    const descInput = document.getElementById('ticket-description');
    const descError = document.getElementById('ticket-desc-error');
    const submitBtn = document.getElementById('btn-submit-ticket');

    createForm?.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!AuthStorage.isAuthenticated()) {
        showToast('Please sign in to submit a support ticket.', 'info');
        setTimeout(() => { window.location.href = 'login.html?redirect=support.html'; }, 500);
        return;
      }

      const descVal = descInput.value.trim();
      if (descVal.length < 5) {
        descInput.classList.add('error');
        if (descError) {
          descError.textContent = 'Please provide at least 5 characters describing the issue.';
          descError.classList.add('visible');
        }
        descInput.focus();
        return;
      }

      descInput.classList.remove('error');
      if (descError) descError.classList.remove('visible');

      const orderIdVal = document.getElementById('ticket-order-id').value;
      const issueTypeVal = document.getElementById('ticket-issue-type').value;

      submitBtn.disabled = true;
      const origHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="spinner" style="width:16px; height:16px; border-width:2px; display:inline-block; vertical-align:middle; margin-right:6px;"></span> Submitting...`;

      try {
        await api.post('/tickets', {
          orderId: orderIdVal ? Number(orderIdVal) : null,
          issueType: issueTypeVal,
          description: descVal
        });

        showToast('Support ticket submitted successfully! Tracking progress now.', 'success');
        createForm.reset();
        this.setupPriorityWatcher();

        // Switch to Track Tickets tab
        setTimeout(() => {
          this.switchTab('track');
        }, 400);
      } catch (err) {
        showToast(err.message || 'Failed to submit support ticket.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    });

    // Refresh tickets button
    document.getElementById('btn-refresh-tickets')?.addEventListener('click', () => {
      this.loadTrackTickets();
      showToast('Ticket list refreshed.', 'info');
    });
  },

  /**
   * Render state when user is not signed in
   */
  renderUnauthenticatedStates() {
    const trackContainer = document.getElementById('track-tickets-container');
    if (trackContainer) {
      trackContainer.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>Please Sign In</h3>
          <p>Sign in to view your open support tickets, milestones, and responses.</p>
          <a href="login.html?redirect=support.html" class="btn btn-primary" style="margin-top:12px;">Sign In</a>
        </div>
      `;
    }

    const feedbackContainer = document.getElementById('feedback-form-container');
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="empty-state">
          <h3>Sign In Required</h3>
          <p>Sign in to submit feedback on your resolved support inquiries.</p>
          <a href="login.html?redirect=support.html" class="btn btn-primary" style="margin-top:12px;">Sign In</a>
        </div>
      `;
    }
  },

  /**
   * Helper to compute timeline progress and active classes
   */
  getTimelineState(status) {
    const s = (status || 'Open').toLowerCase();
    const steps = ['open', 'in progress', 'resolved', 'closed'];

    let currentIndex = 0;
    if (s === 'in progress') currentIndex = 1;
    else if (s === 'resolved') currentIndex = 2;
    else if (s === 'closed') currentIndex = 3;

    // Progress bar width percentage
    const widthPct = (currentIndex / 3) * 100;

    return {
      currentIndex,
      widthPct,
      isStepCompleted: (idx) => idx < currentIndex,
      isStepCurrent: (idx) => idx === currentIndex
    };
  },

  /**
   * Load and render tickets list in Track Tickets tab
   */
  async loadTrackTickets() {
    const container = document.getElementById('track-tickets-container');
    if (!container) return;

    const user = AuthStorage.getUser();
    if (!user) {
      this.renderUnauthenticatedStates();
      return;
    }

    container.innerHTML = `
      <div style="text-align:center; padding: 48px 0;">
        <span class="spinner" style="border-top-color: var(--primary); width: 32px; height: 32px;"></span>
        <p style="margin-top: 12px;">Loading tickets...</p>
      </div>
    `;

    try {
      const res = await api.get('/tickets');
      const tickets = res.tickets || [];

      if (tickets.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <h3>No Support Tickets Found</h3>
            <p>You have not logged any inquiries yet. If you have an order issue or question, create a ticket to get started.</p>
            <button type="button" class="btn btn-primary" onclick="SupportController.switchTab('create')" style="margin-top:12px;">
              Create a Ticket
            </button>
          </div>
        `;
        return;
      }

      const isAdmin = user.ROLE === 'admin';

      container.innerHTML = tickets.map(t => {
        const dateStr = t.CREATED_AT ? new Date(t.CREATED_AT).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Recent';

        // Badges
        const priorityClass = t.PRIORITY === 'High' ? 'badge-priority-high' : t.PRIORITY === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low';
        let statusClass = 'badge-status-open';
        if (t.STATUS === 'In Progress') statusClass = 'badge-status-in-progress';
        else if (t.STATUS === 'Resolved') statusClass = 'badge-status-resolved';
        else if (t.STATUS === 'Closed') statusClass = 'badge-status-closed';

        // Timeline state
        const timeline = this.getTimelineState(t.STATUS);

        return `
          <div class="card" style="padding: 24px; margin-bottom: 24px;" data-ticket-id="${t.TICKET_ID}">
            <!-- Ticket Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; border-bottom:1px solid var(--border); padding-bottom:16px; margin-bottom:16px;">
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                  <span style="font-weight:700; font-size:1.0625rem; color:var(--text);">#TKT-${t.TICKET_ID}</span>
                  <span class="badge ${priorityClass}" style="font-weight:600; font-size:0.75rem;">${escapeHtml(t.PRIORITY)} Priority</span>
                  <span class="badge ${statusClass}" style="font-weight:600; font-size:0.75rem;">${escapeHtml(t.STATUS)}</span>
                </div>
                <div style="font-size:0.875rem; font-weight:600; color:var(--text);">
                  ${escapeHtml(t.ISSUE_TYPE)}
                  ${t.ORDER_ID ? `<span class="text-xs text-muted font-normal" style="margin-left:8px;">(Ref: Order #SC-${t.ORDER_ID})</span>` : ''}
                </div>
                ${isAdmin && t.FULL_NAME ? `<div class="text-xs text-muted" style="margin-top:2px;">User: ${escapeHtml(t.FULL_NAME)} (${escapeHtml(t.EMAIL)})</div>` : ''}
              </div>

              <div class="text-xs text-muted" style="text-align:right;">
                <div>Logged on</div>
                <div class="font-medium" style="color:var(--text); margin-top:2px;">${dateStr}</div>
              </div>
            </div>

            <!-- Description -->
            <div style="font-size:0.9375rem; color:var(--text); line-height:1.5; margin-bottom:20px; background:var(--bg); padding:16px; border-radius:var(--radius); border:1px solid var(--border);">
              ${escapeHtml(t.DESCRIPTION)}
            </div>

            <!-- Simple Progress Timeline -->
            <div style="margin-bottom:20px;">
              <span class="text-xs text-muted font-medium">RESOLUTION PROGRESS</span>
              <div class="ticket-timeline">
                <div class="timeline-progress-bar" style="width: calc(${timeline.widthPct}% * 0.85);"></div>

                <!-- Step 1: Open -->
                <div class="timeline-step ${timeline.isStepCompleted(0) ? 'completed' : timeline.isStepCurrent(0) ? 'current' : ''}">
                  <div class="timeline-dot">
                    ${timeline.isStepCompleted(0) ? '✓' : '1'}
                  </div>
                  <div class="timeline-label">Open</div>
                </div>

                <!-- Step 2: In Progress -->
                <div class="timeline-step ${timeline.isStepCompleted(1) ? 'completed' : timeline.isStepCurrent(1) ? 'current' : ''}">
                  <div class="timeline-dot">
                    ${timeline.isStepCompleted(1) ? '✓' : '2'}
                  </div>
                  <div class="timeline-label">In Progress</div>
                </div>

                <!-- Step 3: Resolved -->
                <div class="timeline-step ${timeline.isStepCompleted(2) ? 'completed' : timeline.isStepCurrent(2) ? 'current' : ''}">
                  <div class="timeline-dot">
                    ${timeline.isStepCompleted(2) ? '✓' : '3'}
                  </div>
                  <div class="timeline-label">Resolved</div>
                </div>

                <!-- Step 4: Closed -->
                <div class="timeline-step ${timeline.isStepCompleted(3) || timeline.isStepCurrent(3) ? 'completed' : ''}">
                  <div class="timeline-dot">
                    ${timeline.isStepCompleted(3) || timeline.isStepCurrent(3) ? '✓' : '4'}
                  </div>
                  <div class="timeline-label">Closed</div>
                </div>
              </div>
            </div>

            <!-- Bottom Actions / Feedback status / Admin Controls -->
            <div style="border-top:1px solid var(--border); padding-top:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <!-- Left: Feedback status or Action -->
              <div>
                ${t.STATUS === 'Resolved' && !t.hasFeedback ? `
                  <button type="button" class="btn btn-outline btn-sm btn-rate-ticket" data-ticket-id="${t.TICKET_ID}" style="color:var(--primary); font-weight:600;">
                    ⭐ Leave Feedback for this Ticket
                  </button>
                ` : t.hasFeedback ? `
                  <div style="font-size:0.875rem; color:#D97706; display:flex; align-items:center; gap:6px;">
                    <span>${'★'.repeat(t.FEEDBACK.RATING)}${'☆'.repeat(5 - t.FEEDBACK.RATING)}</span>
                    <span class="text-xs text-muted">Feedback recorded (${t.FEEDBACK.RATING}/5)</span>
                  </div>
                ` : `
                  <span class="text-xs text-muted">Awaiting support desk updates.</span>
                `}
              </div>

              <!-- Right: Admin Status Update Controls -->
              ${isAdmin ? `
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="text-xs text-muted font-medium">ADMIN:</span>
                  <select class="form-control select-admin-status" style="width:auto; padding:4px 8px; font-size:0.8125rem;">
                    <option value="Open" ${t.STATUS === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="In Progress" ${t.STATUS === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Resolved" ${t.STATUS === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="Closed" ${t.STATUS === 'Closed' ? 'selected' : ''}>Closed</option>
                  </select>
                  <button type="button" class="btn btn-outline btn-sm btn-admin-update-status" data-ticket-id="${t.TICKET_ID}">
                    Update
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      // Bind "Leave Feedback" buttons
      container.querySelectorAll('.btn-rate-ticket').forEach(btn => {
        btn.addEventListener('click', () => {
          const tId = Number(btn.dataset.ticketId);
          this.switchTab('feedback', { ticketId: tId });
        });
      });

      // Bind Admin Status update buttons
      container.querySelectorAll('.btn-admin-update-status').forEach(btn => {
        btn.addEventListener('click', async () => {
          const tId = Number(btn.dataset.ticketId);
          const card = btn.closest('.card');
          const select = card.querySelector('.select-admin-status');
          const newStatus = select ? select.value : 'Open';

          btn.disabled = true;
          try {
            await api.put('/tickets/status', { ticketId: tId, status: newStatus });
            showToast(`Ticket #${tId} status updated to ${newStatus}.`, 'success');
            await this.loadTrackTickets();
            await this.loadFeedbackTab();
          } catch (err) {
            showToast(err.message || 'Failed to update ticket status.', 'error');
          } finally {
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      console.error('Failed to load tickets:', err);
      container.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">Error loading tickets.</p></div>`;
    }
  },

  /**
   * Load and render Feedback tab
   * Available ONLY for Resolved tickets, and only once per ticket
   */
  async loadFeedbackTab() {
    const formContainer = document.getElementById('feedback-form-container');
    const pastSection = document.getElementById('past-feedback-section');
    const pastList = document.getElementById('past-feedback-list');
    if (!formContainer) return;

    if (!AuthStorage.isAuthenticated()) {
      this.renderUnauthenticatedStates();
      return;
    }

    try {
      const res = await api.get('/tickets');
      const allTickets = res.tickets || [];

      // Filter resolved tickets that have NOT yet received feedback
      const pendingResolvedTickets = allTickets.filter(t => t.STATUS === 'Resolved' && !t.hasFeedback);
      // Tickets that already have feedback
      const resolvedWithFeedback = allTickets.filter(t => t.hasFeedback);

      // Render past feedback section if any exist
      if (pastSection && pastList) {
        if (resolvedWithFeedback.length > 0) {
          pastSection.style.display = 'block';
          pastList.innerHTML = resolvedWithFeedback.map(t => `
            <div class="card" style="padding:16px 20px; font-size:0.875rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong>Ticket #TKT-${t.TICKET_ID} (${escapeHtml(t.ISSUE_TYPE)})</strong>
                <div style="color:#F59E0B; font-size:1rem;">
                  ${'★'.repeat(t.FEEDBACK.RATING)}${'☆'.repeat(5 - t.FEEDBACK.RATING)}
                </div>
              </div>
              <p class="text-sm text-muted" style="margin-bottom:0;">
                "${escapeHtml(t.FEEDBACK.COMMENTS || 'No written comments provided.')}"
              </p>
            </div>
          `).join('');
        } else {
          pastSection.style.display = 'none';
        }
      }

      // If no tickets are pending feedback
      if (pendingResolvedTickets.length === 0) {
        formContainer.innerHTML = `
          <div class="empty-state" style="padding: 24px 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <h3>No Resolved Tickets Pending Feedback</h3>
            <p>Feedback can only be submitted once per ticket after our support team marks your inquiry as <strong>Resolved</strong>.</p>
            <button type="button" class="btn btn-outline btn-sm" onclick="SupportController.switchTab('track')" style="margin-top:12px;">
              View Ticket Progress
            </button>
          </div>
        `;
        return;
      }

      // Render Feedback form
      const preselectedId = this.preselectedTicketIdForFeedback;

      formContainer.innerHTML = `
        <form id="feedback-submission-form">
          <div class="form-group">
            <label class="form-label" for="fb-ticket-id">Select Resolved Ticket <span style="color:var(--danger)">*</span></label>
            <select id="fb-ticket-id" class="form-control" required>
              ${pendingResolvedTickets.map(t => `
                <option value="${t.TICKET_ID}" ${preselectedId === t.TICKET_ID ? 'selected' : ''}>
                  #TKT-${t.TICKET_ID} — ${escapeHtml(t.ISSUE_TYPE)} (Status: Resolved)
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Service Rating (1 to 5 Stars) <span style="color:var(--danger)">*</span></label>
            <div class="star-rating-box" id="star-rating-widget">
              ${[1, 2, 3, 4, 5].map(star => `
                <button type="button" class="star-btn" data-rating="${star}" aria-label="Rate ${star} Stars">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              `).join('')}
            </div>
            <input type="hidden" id="fb-rating-value" value="5" />
            <div id="star-rating-label" class="text-xs text-muted" style="font-weight:600;">
              Selected: 5 Stars (Excellent Support)
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="fb-comments">Comments &amp; Experience Details</label>
            <textarea id="fb-comments" class="form-control" rows="3" placeholder="Tell us about the speed, helpfulness, and resolution quality..."></textarea>
          </div>

          <button type="submit" id="btn-submit-feedback" class="btn btn-primary btn-lg">
            Submit Feedback
          </button>
        </form>
      `;

      // Clear preselected ticket id so subsequent visits work normally
      this.preselectedTicketIdForFeedback = null;

      // Bind interactive star rating widget
      let currentRating = 5;
      const starBtns = formContainer.querySelectorAll('.star-btn');
      const ratingInput = document.getElementById('fb-rating-value');
      const ratingLabel = document.getElementById('star-rating-label');

      const labels = {
        1: '1 Star (Poor Experience)',
        2: '2 Stars (Fair)',
        3: '3 Stars (Average)',
        4: '4 Stars (Good Support)',
        5: '5 Stars (Excellent Support)'
      };

      const renderStars = (r) => {
        starBtns.forEach(btn => {
          const val = Number(btn.dataset.rating);
          btn.classList.toggle('filled', val <= r);
        });
        if (ratingLabel) {
          ratingLabel.textContent = `Selected: ${labels[r] || `${r} Stars`}`;
        }
      };

      renderStars(currentRating);

      starBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          const r = Number(btn.dataset.rating);
          renderStars(r);
        });

        btn.addEventListener('click', () => {
          currentRating = Number(btn.dataset.rating);
          ratingInput.value = currentRating;
          renderStars(currentRating);
        });
      });

      const starWidget = document.getElementById('star-rating-widget');
      starWidget?.addEventListener('mouseleave', () => {
        renderStars(currentRating);
      });

      // Bind Feedback submit
      const fbForm = document.getElementById('feedback-submission-form');
      const fbSubmitBtn = document.getElementById('btn-submit-feedback');

      fbForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ticketIdVal = document.getElementById('fb-ticket-id').value;
        const ratingVal = Number(ratingInput.value);
        const commentsVal = document.getElementById('fb-comments').value.trim();

        fbSubmitBtn.disabled = true;
        const orig = fbSubmitBtn.innerHTML;
        fbSubmitBtn.innerHTML = `<span class="spinner" style="width:16px; height:16px; border-width:2px; display:inline-block; vertical-align:middle; margin-right:6px;"></span> Submitting...`;

        try {
          await api.post('/feedback', {
            ticketId: Number(ticketIdVal),
            rating: ratingVal,
            comments: commentsVal
          });

          showToast('Thank you for your feedback! Your review helps us improve.', 'success');
          await this.loadFeedbackTab();
          await this.loadTrackTickets();
        } catch (err) {
          showToast(err.message || 'Failed to submit feedback.', 'error');
          fbSubmitBtn.disabled = false;
          fbSubmitBtn.innerHTML = orig;
        }
      });

    } catch (e) {
      console.error('Error loading feedback tab:', e);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SupportController.init();
});

window.SupportController = SupportController;
