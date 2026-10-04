/**
 * SmartCart - Auth Controller
 * Handles user registration, credentials verification, JWT issuance, and profile retrieval/updating.
 */

import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import db from '../config/db.js';

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

      // Trim and lowercase email
      const cleanEmail = email.trim().toLowerCase();

      // 2. Check if user already exists
      const existingUser = User.findByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.'
        });
      }

      // 3. Create user record with bcrypt password hash
      const newUser = User.create({
        fullName: fullName.trim(),
        email: cleanEmail,
        password: password,
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

      // Trim and lowercase email
      const cleanEmail = email.trim().toLowerCase();
      const user = User.findByEmail(cleanEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email'
        });
      }

      // Validate bcrypt password
      const isValidPassword = User.comparePassword(password, user.PASSWORD);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
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
   * GET /api/profile and GET /api/me
   * Returns current authenticated user data with order summary metrics
   */
  async getProfile(req, res) {
    try {
      const user = User.findById(req.user.USER_ID);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      const orders = db.rawDb.prepare('SELECT TOTAL_AMOUNT FROM ORDERS WHERE USER_ID = ?').all(req.user.USER_ID);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.TOTAL_AMOUNT || 0), 0);

      return res.status(200).json({
        success: true,
        user: User.sanitize(user),
        orderSummary: {
          totalOrders,
          totalSpent: Number(totalSpent.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile information.'
      });
    }
  },

  /**
   * PUT /api/profile
   * Updates user full name, phone number (validated 10 digits), and address
   */
  async updateProfile(req, res) {
    try {
      const { fullName, phone, address } = req.body;

      if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters.'
        });
      }

      // Validate phone number has 10 digits
      const rawPhone = (phone || '').trim();
      const phoneDigits = rawPhone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must have exactly 10 digits.'
        });
      }

      const cleanAddress = (address || '').trim();

      const stmt = db.rawDb.prepare(`
        UPDATE USERS
        SET FULL_NAME = ?, PHONE = ?, ADDRESS = ?
        WHERE USER_ID = ?
      `);

      stmt.run(fullName.trim(), rawPhone, cleanAddress, req.user.USER_ID);

      const updatedUser = User.findById(req.user.USER_ID);

      // Re-fetch order metrics
      const orders = db.rawDb.prepare('SELECT TOTAL_AMOUNT FROM ORDERS WHERE USER_ID = ?').all(req.user.USER_ID);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.TOTAL_AMOUNT || 0), 0);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: User.sanitize(updatedUser),
        orderSummary: {
          totalOrders,
          totalSpent: Number(totalSpent.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile.'
      });
    }
  }
};

export default authController;
