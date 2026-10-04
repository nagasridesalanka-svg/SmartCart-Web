/**
 * SmartCart - Authentication Middleware
 * Validates JWT in the Authorization header (Bearer <token>)
 * Attaches the authenticated user object to req.user
 */

import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No valid authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    const decoded = verifyToken(token);
    const user = User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user session is no longer valid.'
      });
    }

    // Attach sanitized user to request
    req.user = User.sanitize(user);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
}

export default authenticate;
