/**
 * SmartCart - User Model
 * Maps directly to USERS(USER_ID, FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
 * Uses persistent SQLite database at backend/data/smartcart.db
 */

import db from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = {
  /**
   * Finds a user by email address (trimmed and lowercased)
   */
  findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const row = db.rawDb.prepare('SELECT * FROM USERS WHERE LOWER(TRIM(EMAIL)) = ?').get(cleanEmail);
    return row || null;
  },

  /**
   * Finds a user by ID
   */
  findById(id) {
    if (!id) return null;
    const row = db.rawDb.prepare('SELECT * FROM USERS WHERE USER_ID = ?').get(Number(id));
    return row || null;
  },

  /**
   * Creates a new user record with bcrypt hashed password
   */
  create({ fullName, email, password, phone = '', address = '', role = 'customer' }) {
    const cleanEmail = email.trim().toLowerCase();
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdAt = new Date().toISOString();

    const stmt = db.rawDb.prepare(`
      INSERT INTO USERS (FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const res = stmt.run(
      fullName.trim(),
      cleanEmail,
      hashedPassword,
      phone ? phone.trim() : '',
      address ? address.trim() : '',
      role,
      createdAt
    );

    return this.findById(Number(res.lastInsertRowid));
  },

  /**
   * Compares plain text password against stored bcrypt hash using bcrypt.compare
   */
  comparePassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    return bcrypt.compareSync(plainPassword, hashedPassword);
  },

  /**
   * Strips password hash before returning user object to client
   */
  sanitize(user) {
    if (!user) return null;
    const { PASSWORD, ...safeUser } = user;
    return safeUser;
  }
};

export default User;
