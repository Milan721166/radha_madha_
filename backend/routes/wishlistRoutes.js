const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET User Wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await dbAsync.all(`
      SELECT w.id as wishlist_id, w.created_at as added_at, p.*, pi.image_url
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      wishlist: items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
});

// Toggle Item in Wishlist
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const existing = await dbAsync.get('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);

    if (existing) {
      await dbAsync.run('DELETE FROM wishlist WHERE id = ?', [existing.id]);
      return res.json({ success: true, added: false, message: 'Item removed from wishlist' });
    } else {
      await dbAsync.run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
      return res.json({ success: true, added: true, message: 'Item added to wishlist' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update wishlist' });
  }
});

module.exports = router;
