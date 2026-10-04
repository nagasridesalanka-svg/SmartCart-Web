/**
 * SmartCart - JWT Configuration and Token Helpers
 * Manages JSON Web Token signing and verification for session management.
 */

import jwt from 'jsonwebtoken';

// In production, keep this secret securely in environment variables.
const JWT_SECRET = process.env.JWT_SECRET || 'smartcart_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generates a signed JWT for an authenticated user.
 * @param {Object} user - User record from USERS table.
 * @returns {string} Signed JWT string.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.USER_ID,
      email: user.EMAIL,
      fullName: user.FULL_NAME,
      role: user.ROLE
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifies a JWT and extracts the decoded payload.
 * @param {string} token - Bearer token string.
 * @returns {Object} Decoded payload.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export default {
  generateToken,
  verifyToken,
  JWT_SECRET
};
