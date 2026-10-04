/**
 * SmartCart - Support & Feedback Routes
 */

import { Router } from 'express';
import supportController from '../controllers/supportController.js';
import authenticate from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

// Ticket routes (login required)
router.post('/tickets', authenticate, supportController.createTicket);
router.get('/tickets', authenticate, supportController.getTickets);
router.put('/tickets/status', authenticate, requireAdmin, supportController.updateTicketStatus);

// Feedback route (login required)
router.post('/feedback', authenticate, supportController.submitFeedback);

export default router;
