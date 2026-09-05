const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');

// GET all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await dbAsync.all(`
      SELECT * FROM categories 
      WHERE status = 'active' 
      ORDER BY display_order ASC, name ASC
    `);

    // Attach count of published products in each category
    for (let cat of categories) {
      const countRes = await dbAsync.get('SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = "published"', [cat.id]);
      cat.product_count = countRes ? countRes.total : 0;
    }

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

module.exports = router;
