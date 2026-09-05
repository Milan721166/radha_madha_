const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Get Reviews for Product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await dbAsync.all(`
      SELECT * FROM reviews 
      WHERE product_id = ? AND status = 'approved' 
      ORDER BY created_at DESC
    `, [req.params.productId]);

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Submit Product Review (Verified Purchase Check)
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { productId, rating, reviewText } = req.body;
    if (!productId || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Rating and review text are required' });
    }

    // Verify if customer bought this product
    const verifiedOrder = await dbAsync.get(`
      SELECT o.id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.order_status = 'delivered'
    `, [req.user.id, productId]);

    const isVerified = verifiedOrder ? 1 : 0;

    await dbAsync.run(`
      INSERT INTO reviews (product_id, user_id, user_name, rating, review_text, verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, 'approved')
    `, [productId, req.user.id, req.user.name, rating, reviewText, isVerified]);

    // Recalculate Product average rating & count
    const stats = await dbAsync.get(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count 
      FROM reviews 
      WHERE product_id = ? AND status = 'approved'
    `, [productId]);

    if (stats) {
      await dbAsync.run(`
        UPDATE products SET rating_avg = ?, reviews_count = ? WHERE id = ?
      `, [Math.round(stats.avg_rating * 10) / 10, stats.count, productId]);
    }

    res.json({ success: true, message: 'Thank you! Your review has been published.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

module.exports = router;
