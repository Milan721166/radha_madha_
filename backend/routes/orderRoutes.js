const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const gateway = require('../services/paymentGateway');

router.get('/payment/config', (req, res) => res.json({ success: true, enabled: gateway.configured() }));

router.post('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const order = await dbAsync.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order || order.payment_method !== 'UPI' || order.order_status === 'cancelled') return res.status(400).json({ success: false, message: 'Order is unavailable for payment.' });
    if (order.payment_status === 'paid') return res.json({ success: true, status: 'paid' });
    let payment;
    try { payment = await gateway.checkPayment(order); } catch { payment = await gateway.createPayment(order); }
    res.json({ success: true, paymentUrl: payment.payment_url, status: payment.status });
  } catch (err) { res.status(502).json({ success: false, message: err.message }); }
});

router.get('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const order = await dbAsync.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order || order.payment_method !== 'UPI') return res.status(404).json({ success: false, message: 'Payment order not found.' });
    const payment = await gateway.checkPayment(order);
    if (payment.status === 'paid' && order.order_status !== 'cancelled') {
      await dbAsync.run("UPDATE orders SET payment_status = 'paid', order_status = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END WHERE id = ? AND payment_status <> 'paid'", [order.id]);
    }
    res.json({ success: true, status: payment.status, order: { id: order.id, orderNumber: order.order_number, totalAmount: Number(order.total_amount), paymentMethod: order.payment_method } });
  } catch (err) { res.status(502).json({ success: false, message: err.message }); }
});

// Place Order
router.post('/create', authenticateToken, async (req, res) => {
  try {
    let {
      shippingAddress,
      paymentMethod = 'COD',
      items,
      subtotal,
      shippingFee = 0,
      taxAmount = 0,
      discountAmount = 0,
      totalAmount,
      notes
    } = req.body;

    if (!['COD', 'UPI'].includes(paymentMethod)) return res.status(400).json({ success: false, message: 'Unsupported payment method.' });
    if (paymentMethod === 'UPI' && !gateway.configured()) return res.status(503).json({ success: false, message: 'Online payments are not configured.' });

    if (!items || !items.length || !shippingAddress || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Invalid order details or cart is empty' });
    }

    // Always charge catalog prices and store-computed totals, never browser totals.
    subtotal = 0;
    for (const item of items) {
      const product = await dbAsync.get('SELECT * FROM products WHERE id = ?', [item.product_id || item.productId]);
      const quantity = Number(item.quantity);
      if (!product || product.status !== 'published' || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return res.status(400).json({ success: false, message: 'An item is unavailable or has insufficient stock.' });
      const variantId = item.variant_id || item.variantId;
      if (variantId) {
        const variant = await dbAsync.get('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [variantId, product.id]);
        if (!variant || quantity > variant.stock) return res.status(400).json({ success: false, message: 'Selected variant is unavailable.' });
      }
      item.unit_price = Number(product.sale_price || product.price);
      item.quantity = quantity;
      item.product_name = product.name;
      subtotal += item.unit_price * quantity;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    shippingFee = subtotal > 999 ? 0 : 99;
    taxAmount = Math.round(subtotal * 0.05);
    discountAmount = 0;
    totalAmount = Math.round((subtotal + shippingFee + taxAmount) * 100) / 100;
    if (paymentMethod === 'UPI' && (totalAmount < 1 || totalAmount > 100000)) return res.status(400).json({ success: false, message: 'UPI payments support amounts from ₹1 to ₹1,00,000.' });

    const user = await dbAsync.get('SELECT name, email, phone FROM users WHERE id = ?', [req.user.id]);

    const orderNumber = 'RM-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const addressStr = typeof shippingAddress === 'string' 
      ? shippingAddress 
      : `${shippingAddress.full_name}, ${shippingAddress.house_flat}, ${shippingAddress.street}, ${shippingAddress.area ? shippingAddress.area + ', ' : ''}${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}, Ph: ${shippingAddress.phone}`;

    const orderResult = await dbAsync.run(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, payment_method, payment_status, order_status,
        subtotal, shipping_fee, tax_amount, discount_amount, total_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      req.user.id,
      user ? user.name : 'Customer',
      user ? user.email : '',
      user ? user.phone || '' : '',
      addressStr,
      paymentMethod,
      'pending',
      paymentMethod === 'COD' ? 'confirmed' : 'pending',
      subtotal,
      shippingFee,
      taxAmount,
      discountAmount,
      totalAmount,
      notes || ''
    ]);

    const orderId = orderResult.id;

    // Insert Order Items and Update Inventory Stock
    for (const item of items) {
      const unitPrice = item.unit_price || item.sale_price || item.price;
      const itemTotal = unitPrice * item.quantity;
      await dbAsync.run(`
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, size, color, image, price, quantity, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id || item.productId,
        item.variant_id || item.variantId || null,
        item.product_name || item.name || 'Fashion Item',
        item.variant_sku || item.sku || 'RM-SKU',
        item.size || '',
        item.color || '',
        item.image || '',
        unitPrice,
        item.quantity,
        itemTotal
      ]);

      // Reduce product stock automatically (ANSI SQL CASE syntax for MySQL & SQLite compatibility)
      const pId = item.product_id || item.productId;
      const vId = item.variant_id || item.variantId;
      const qty = item.quantity || 1;

      await dbAsync.run('UPDATE products SET stock = CASE WHEN stock >= ? THEN stock - ? ELSE 0 END WHERE id = ?', [qty, qty, pId]);
      if (vId) {
        await dbAsync.run('UPDATE product_variants SET stock = CASE WHEN stock >= ? THEN stock - ? ELSE 0 END WHERE id = ?', [qty, qty, vId]);
      }

      // Log Inventory change
      await dbAsync.run(`
        INSERT INTO inventory_logs (product_id, variant_id, change_qty, type, reference_id, note)
        VALUES (?, ?, ?, 'sale', ?, 'Order Placed')
      `, [item.product_id || item.productId, item.variant_id || item.variantId || null, -item.quantity, orderNumber]);
    }

    // Log Order Status History
    await dbAsync.run(`
      INSERT INTO order_status_history (order_id, status, comment)
      VALUES (?, ?, 'Order placed successfully by customer')
    `, [orderId, paymentMethod === 'COD' ? 'confirmed' : 'pending']);

    // Clear Customer Cart after order placement
    const cart = await dbAsync.get('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (cart) {
      await dbAsync.run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: {
        id: orderId,
        orderNumber,
        totalAmount,
        paymentMethod
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// GET My Orders list
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await dbAsync.all(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);

    for (let order of orders) {
      order.items = await dbAsync.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders' });
  }
});

// GET Order Tracking & Details (By Order Number or ID)
router.get('/track/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let order;

    if (!isNaN(identifier)) {
      order = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [identifier]);
    } else {
      order = await dbAsync.get('SELECT * FROM orders WHERE order_number = ?', [identifier]);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order number not found' });
    }

    const items = await dbAsync.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const history = await dbAsync.all('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tracking details' });
  }
});

// Customer Cancel Order
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await dbAsync.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.order_status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.order_status}` });
    }

    await dbAsync.run('UPDATE orders SET order_status = "cancelled" WHERE id = ?', [order.id]);

    // Restore stock
    const items = await dbAsync.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    for (let item of items) {
      await dbAsync.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      if (item.variant_id) {
        await dbAsync.run('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [item.quantity, item.variant_id]);
      }
    }

    await dbAsync.run('INSERT INTO order_status_history (order_id, status, comment) VALUES (?, "cancelled", "Cancelled by customer")', [order.id]);

    res.json({ success: true, message: 'Order cancelled successfully and stock restored' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

// Request Return
router.post('/:id/return', authenticateToken, async (req, res) => {
  try {
    const { productId, reason, description } = req.body;
    const order = await dbAsync.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await dbAsync.run(`
      INSERT INTO returns (order_id, user_id, product_id, reason, description, status)
      VALUES (?, ?, ?, ?, ?, 'requested')
    `, [order.id, req.user.id, productId || 0, reason, description || '']);

    res.json({ success: true, message: 'Return request submitted. Our team will review it within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit return request' });
  }
});

module.exports = router;
