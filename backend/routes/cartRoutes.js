const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Helper to get or create cart ID
async function getOrCreateCartId(userId) {
  let cart = await dbAsync.get('SELECT id FROM cart WHERE user_id = ?', [userId]);
  if (!cart) {
    const res = await dbAsync.run('INSERT INTO cart (user_id) VALUES (?)', [userId]);
    return res.id;
  }
  return cart.id;
}

// GET Cart items & subtotal
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.id);
    const items = await dbAsync.all(`
      SELECT ci.*, p.name as product_name, p.slug, p.price, p.sale_price, p.stock,
             pi.image_url as image, pv.sku as variant_sku, pv.stock as variant_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    let subtotal = 0;
    items.forEach(item => {
      const itemPrice = item.sale_price || item.price;
      item.unit_price = itemPrice;
      item.total_price = itemPrice * item.quantity;
      subtotal += item.total_price;
    });

    const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const taxAmount = Math.round(subtotal * 0.05);

    res.json({
      success: true,
      cartId,
      items,
      summary: {
        subtotal,
        shippingFee,
        taxAmount,
        discountAmount: 0,
        totalAmount: subtotal + shippingFee + taxAmount
      }
    });
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
  }
});

// Add Item to Cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, variantId, size, color, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const cartId = await getOrCreateCartId(req.user.id);

    // Check if item already exists in cart with same size/color
    const existing = await dbAsync.get(`
      SELECT id, quantity FROM cart_items 
      WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (size = ? AND color = ?))
    `, [cartId, productId, variantId || 0, size || '', color || '']);

    if (existing) {
      await dbAsync.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await dbAsync.run(`
        INSERT INTO cart_items (cart_id, product_id, variant_id, size, color, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [cartId, productId, variantId || null, size || '', color || '', quantity]);
    }

    res.json({ success: true, message: 'Product added to cart successfully' });
  } catch (err) {
    console.error('Add cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// Update Item Quantity
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await dbAsync.run('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
    } else {
      await dbAsync.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    }
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update cart item' });
  }
});

// Delete Item from Cart
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// Apply Coupon Code
router.post('/apply-coupon', authenticateToken, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await dbAsync.get('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND status = "active"', [code]);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (subtotal < coupon.min_order_value) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.min_order_value} required for code ${coupon.code}`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount > 0 && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        discountAmount: Math.round(discount)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Coupon application error' });
  }
});

module.exports = router;
