/**
 * SmartCart - Support & Feedback Controller
 * Manages support ticket creation, tracking, status transitions, and customer feedback.
 */

import db from '../config/db.js';

const ALLOWED_ISSUE_TYPES = [
  'Delayed Delivery',
  'Refund Request',
  'Damaged Product',
  'Payment Issue',
  'Other'
];

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const supportController = {
  /**
   * POST /api/tickets (Login required)
   * Creates a new support ticket with auto-assigned priority:
   * - Payment Issue, Damaged Product => High
   * - Refund Request => Medium
   * - Others => Low
   */
  async createTicket(req, res) {
    try {
      const { orderId, issueType, description } = req.body;

      if (!issueType || !ALLOWED_ISSUE_TYPES.includes(issueType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid issue type. Must be one of: ${ALLOWED_ISSUE_TYPES.join(', ')}`
        });
      }

      if (!description || description.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a descriptive explanation of your issue (at least 5 characters).'
        });
      }

      // Priority auto-assignment per requirements
      let priority = 'Low';
      if (issueType === 'Payment Issue' || issueType === 'Damaged Product') {
        priority = 'High';
      } else if (issueType === 'Refund Request') {
        priority = 'Medium';
      }

      // Optional Order verification
      let cleanOrderId = null;
      if (orderId && Number(orderId)) {
        const orderNum = Number(orderId);
        const orderRow = db.rawDb.prepare('SELECT ORDER_ID, USER_ID FROM ORDERS WHERE ORDER_ID = ?').get(orderNum);
        if (orderRow) {
          cleanOrderId = orderNum;
        }
      }

      const stmt = db.rawDb.prepare(`
        INSERT INTO SUPPORT_TICKETS (USER_ID, ORDER_ID, ISSUE_TYPE, DESCRIPTION, STATUS, PRIORITY, CREATED_AT)
        VALUES (?, ?, ?, ?, 'Open', ?, ?)
      `);

      const now = new Date().toISOString();
      const result = stmt.run(
        req.user.USER_ID,
        cleanOrderId,
        issueType,
        description.trim(),
        priority,
        now
      );

      const ticketId = Number(result.lastInsertRowid);
      const newTicket = db.rawDb.prepare('SELECT * FROM SUPPORT_TICKETS WHERE TICKET_ID = ?').get(ticketId);

      return res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully.',
        ticket: newTicket
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create support ticket.'
      });
    }
  },

  /**
   * GET /api/tickets (Login required)
   * Returns user tickets (or all tickets if admin), newest first with feedback info.
   */
  async getTickets(req, res) {
    try {
      const isAdmin = req.user.ROLE === 'admin';
      let sql = `
        SELECT t.TICKET_ID, t.USER_ID, t.ORDER_ID, t.ISSUE_TYPE, t.DESCRIPTION,
               t.STATUS, t.PRIORITY, t.CREATED_AT,
               u.FULL_NAME, u.EMAIL,
               f.FEEDBACK_ID, f.RATING, f.COMMENTS as FEEDBACK_COMMENTS
        FROM SUPPORT_TICKETS t
        LEFT JOIN USERS u ON t.USER_ID = u.USER_ID
        LEFT JOIN SUPPORT_FEEDBACK f ON t.TICKET_ID = f.TICKET_ID
      `;

      let tickets;
      if (isAdmin) {
        sql += ` ORDER BY t.TICKET_ID DESC`;
        tickets = db.rawDb.prepare(sql).all();
      } else {
        sql += ` WHERE t.USER_ID = ? ORDER BY t.TICKET_ID DESC`;
        tickets = db.rawDb.prepare(sql).all(req.user.USER_ID);
      }

      const formatted = tickets.map(t => ({
        ...t,
        hasFeedback: !!t.FEEDBACK_ID,
        FEEDBACK: t.FEEDBACK_ID ? {
          FEEDBACK_ID: t.FEEDBACK_ID,
          RATING: t.RATING,
          COMMENTS: t.FEEDBACK_COMMENTS
        } : null
      }));

      return res.status(200).json({
        success: true,
        tickets: formatted
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve support tickets.'
      });
    }
  },

  /**
   * PUT /api/tickets/status (Admin only)
   * Updates a ticket's status: Open, In Progress, Resolved, Closed.
   */
  async updateTicketStatus(req, res) {
    try {
      const { ticketId, status } = req.body;

      if (!ticketId || !Number(ticketId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid ticket ID is required.'
        });
      }

      if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`
        });
      }

      const ticket = db.rawDb.prepare('SELECT * FROM SUPPORT_TICKETS WHERE TICKET_ID = ?').get(Number(ticketId));
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found.'
        });
      }

      db.rawDb.prepare('UPDATE SUPPORT_TICKETS SET STATUS = ? WHERE TICKET_ID = ?').run(status, Number(ticketId));

      const updated = db.rawDb.prepare('SELECT * FROM SUPPORT_TICKETS WHERE TICKET_ID = ?').get(Number(ticketId));

      return res.status(200).json({
        success: true,
        message: `Ticket #${ticketId} status updated to ${status}.`,
        ticket: updated
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update ticket status.'
      });
    }
  },

  /**
   * POST /api/feedback (Login required)
   * Submits 1-5 star feedback and comments:
   * - Available ONLY for Resolved tickets
   * - Available ONLY once per ticket
   */
  async submitFeedback(req, res) {
    try {
      const { ticketId, rating, comments } = req.body;

      if (!ticketId || !Number(ticketId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid ticket ID is required.'
        });
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5 stars.'
        });
      }

      const ticket = db.rawDb.prepare('SELECT * FROM SUPPORT_TICKETS WHERE TICKET_ID = ?').get(Number(ticketId));
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found.'
        });
      }

      // Check ownership (non-admin can only review their own tickets)
      if (req.user.ROLE !== 'admin' && ticket.USER_ID !== req.user.USER_ID) {
        return res.status(403).json({
          success: false,
          message: 'You can only submit feedback for your own support tickets.'
        });
      }

      // Must be Resolved
      if (ticket.STATUS !== 'Resolved') {
        return res.status(400).json({
          success: false,
          message: 'Feedback can only be submitted for Resolved tickets.'
        });
      }

      // Only once per ticket
      const existingFeedback = db.rawDb.prepare('SELECT FEEDBACK_ID FROM SUPPORT_FEEDBACK WHERE TICKET_ID = ?').get(Number(ticketId));
      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: 'Feedback has already been submitted for this ticket.'
        });
      }

      const stmt = db.rawDb.prepare(`
        INSERT INTO SUPPORT_FEEDBACK (TICKET_ID, RATING, COMMENTS)
        VALUES (?, ?, ?)
      `);

      const resInsert = stmt.run(
        Number(ticketId),
        numRating,
        (comments || '').trim()
      );

      const newFeedback = db.rawDb.prepare('SELECT * FROM SUPPORT_FEEDBACK WHERE FEEDBACK_ID = ?').get(Number(resInsert.lastInsertRowid));

      return res.status(201).json({
        success: true,
        message: 'Thank you for your feedback!',
        feedback: newFeedback
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit feedback.'
      });
    }
  }
};

export default supportController;
