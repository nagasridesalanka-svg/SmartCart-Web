/**
 * SmartCart - User Model
 * Maps directly to USERS(USER_ID, FULL_NAME, EMAIL, PASSWORD, PHONE, ADDRESS, ROLE, CREATED_AT)
 */

import db from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = {
  /**
   * Finds a user by email address
   */
  findByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return db.table('USERS').findOne(u => u.EMAIL.toLowerCase() === normalized);
  },

  /**
   * Finds a user by ID
   */
  findById(id) {
    return db.table('USERS').findById(id, 'USER_ID');
  },

  /**
   * Creates a new user record with hashed password
   */
  create({ fullName, email, password, phone = '', address = '', role = 'customer' }) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      FULL_NAME: fullName.trim(),
      EMAIL: email.trim().toLowerCase(),
      PASSWORD: hashedPassword,
      PHONE: phone ? phone.trim() : '',
      ADDRESS: address ? address.trim() : '',
      ROLE: role,
      CREATED_AT: new Date().toISOString()
    };

    return db.table('USERS').insert(newUser);
  },

  /**
   * Compares plain text password against stored bcrypt hash
   */
  comparePassword(plainPassword, hashedPassword) {
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
