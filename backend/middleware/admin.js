/**
 * SmartCart - Admin-Only Middleware
 * Ensures the authenticated user has the 'admin' role.
 * Must be used AFTER the authenticate middleware.
 */

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.ROLE !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges are required.'
    });
  }

  next();
}

export default requireAdmin;
