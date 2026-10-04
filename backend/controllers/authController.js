/**
 * SmartCart - Auth Controller
 * Handles user registration, credentials verification, JWT issuance, and profile retrieval.
 */

import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';

export const authController = {
  /**
   * POST /api/register
   * Registers a new customer account
   */
  async register(req, res) {
    try {
      const { fullName, email, password, confirmPassword, phone, address } = req.body;

      // 1. Validation checks
      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters.'
        });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      if (confirmPassword !== undefined && password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match.'
        });
      }

      // 2. Check if user already exists
      const existingUser = User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.'
        });
      }

      // 3. Create user record
      const newUser = User.create({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone ? phone.trim() : '',
        address: address ? address.trim() : '',
        role: 'customer'
      });

      const safeUser = User.sanitize(newUser);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! You can now log in.',
        user: safeUser
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'A server error occurred during registration. Please try again.'
      });
    }
  },

  /**
   * POST /api/login
   * Validates credentials and returns JWT token
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password.'
        });
      }

      const user = User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isValidPassword = User.comparePassword(password, user.PASSWORD);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Generate JWT
      const token = generateToken(user);
      const safeUser = User.sanitize(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: safeUser
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during login.'
      });
    }
  },

  /**
   * GET /api/me
   * Returns current authenticated user data
   */
  async getProfile(req, res) {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  }
};

export default authController;
