/**
 * SmartCart - Category Model
 * Maps to CATEGORIES(CATEGORY_ID, CATEGORY_NAME, DESCRIPTION)
 */

import db from '../config/db.js';

const Category = {
  /**
   * Retrieves all categories
   */
  findAll() {
    return db.table('CATEGORIES').find();
  },

  /**
   * Finds category by ID
   */
  findById(id) {
    return db.table('CATEGORIES').findById(id, 'CATEGORY_ID');
  }
};

export default Category;
