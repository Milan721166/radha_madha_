const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// 1. Dashboard Summary KPI Stats & Charts
router.get('/dashboard', async (req, res) => {
  try {
    const totalSalesRes = await dbAsync.get('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid" OR order_status = "delivered"');
    const todaySalesRes = await dbAsync.get('SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = CURDATE() AND order_status != "cancelled"');
    const monthSalesRes = await dbAsync.get('SELECT SUM(total_amount) as total FROM orders WHERE DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m") AND order_status != "cancelled"');

    const totalOrdersRes = await dbAsync.get('SELECT COUNT(*) as total FROM orders');
    const pendingOrdersRes = await dbAsync.get('SELECT COUNT(*) as total FROM orders WHERE order_status IN ("pending", "confirmed", "processing", "packed")');
    const completedOrdersRes = await dbAsync.get('SELECT COUNT(*) as total FROM orders WHERE order_status = "delivered"');
    const cancelledOrdersRes = await dbAsync.get('SELECT COUNT(*) as total FROM orders WHERE order_status = "cancelled"');

    const totalCustomersRes = await dbAsync.get('SELECT COUNT(*) as total FROM users WHERE role = "customer"');
    const totalProductsRes = await dbAsync.get('SELECT COUNT(*) as total FROM products');
    const lowStockRes = await dbAsync.get('SELECT COUNT(*) as total FROM products WHERE stock > 0 AND stock <= low_stock_threshold');
    const outOfStockRes = await dbAsync.get('SELECT COUNT(*) as total FROM products WHERE stock = 0');

    // Sales by Day (Last 7 Days)
    const salesByDay = await dbAsync.all(`
      SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders
      WHERE order_status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Top Selling Products
    const topProducts = await dbAsync.all(`
      SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.total) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Recent Orders
    const recentOrders = await dbAsync.all(`
      SELECT id, order_number, customer_name, total_amount, payment_method, payment_status, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      stats: {
        totalSales: totalSalesRes ? totalSalesRes.total || 0 : 0,
        todaySales: todaySalesRes ? todaySalesRes.total || 0 : 0,
        monthSales: monthSalesRes ? monthSalesRes.total || 0 : 0,
        totalOrders: totalOrdersRes ? totalOrdersRes.total || 0 : 0,
        pendingOrders: pendingOrdersRes ? pendingOrdersRes.total || 0 : 0,
        completedOrders: completedOrdersRes ? completedOrdersRes.total || 0 : 0,
        cancelledOrders: cancelledOrdersRes ? cancelledOrdersRes.total || 0 : 0,
        totalCustomers: totalCustomersRes ? totalCustomersRes.total || 0 : 0,
        totalProducts: totalProductsRes ? totalProductsRes.total || 0 : 0,
        lowStockProducts: lowStockRes ? lowStockRes.total || 0 : 0,
        outOfStockProducts: outOfStockRes ? outOfStockRes.total || 0 : 0
      },
      salesByDay,
      topProducts,
      recentOrders
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard metrics' });
  }
});

// 2. Product Management (List, Add, Update, Delete)
router.get('/products', async (req, res) => {
  try {
    const products = await dbAsync.all(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    for (let p of products) {
      p.images = await dbAsync.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC', [p.id]);
      p.variants = await dbAsync.all('SELECT * FROM product_variants WHERE product_id = ?', [p.id]);
    }

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin products' });
  }
});

// Create / Update Product
router.post('/products', async (req, res) => {
  try {
    const {
      id, name, sku, category_id, short_desc, description,
      price, sale_price, cost_price, stock, low_stock_threshold,
      material, fabric, care_instructions, is_featured, is_bestseller,
      is_new_arrival, status, images, variants
    } = req.body;

    if (!name || !sku || !category_id || !price) {
      return res.status(400).json({ success: false, message: 'Name, SKU, category and price are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let productId = id;

    if (id) {
      await dbAsync.run(`
        UPDATE products SET 
          name=?, slug=?, sku=?, category_id=?, short_desc=?, description=?,
          price=?, sale_price=?, cost_price=?, stock=?, low_stock_threshold=?,
          material=?, fabric=?, care_instructions=?, is_featured=?, is_bestseller=?,
          is_new_arrival=?, status=?
        WHERE id=?
      `, [
        name, slug, sku, category_id, short_desc || '', description || '',
        price, sale_price || null, cost_price || null, stock || 0, low_stock_threshold || 5,
        material || '', fabric || '', care_instructions || '',
        is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0, status || 'published',
        id
      ]);
    } else {
      const result = await dbAsync.run(`
        INSERT INTO products (
          name, slug, sku, category_id, short_desc, description,
          price, sale_price, cost_price, stock, low_stock_threshold,
          material, fabric, care_instructions, is_featured, is_bestseller,
          is_new_arrival, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, slug, sku, category_id, short_desc || '', description || '',
        price, sale_price || null, cost_price || null, stock || 0, low_stock_threshold || 5,
        material || '', fabric || '', care_instructions || '',
        is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0, status || 'published'
      ]);
      productId = result.id;
    }

    // Save Images
    if (images && images.length) {
      await dbAsync.run('DELETE FROM product_images WHERE product_id = ?', [productId]);
      for (let i = 0; i < images.length; i++) {
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].image_url;
        await dbAsync.run('INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)', [productId, imgUrl, i === 0 ? 1 : 0, i]);
      }
    }

    // Save Variants
    if (variants && variants.length) {
      await dbAsync.run('DELETE FROM product_variants WHERE product_id = ?', [productId]);
      for (const v of variants) {
        await dbAsync.run(`
          INSERT INTO product_variants (product_id, sku, size, color, hex_code, price, sale_price, stock, image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [productId, v.sku || `${sku}-${v.size || 'STD'}`, v.size || '', v.color || '', v.hex_code || '', v.price || price, v.sale_price || sale_price || null, v.stock || 0, v.image || '']);
      }
    }

    res.json({ success: true, message: `Product ${id ? 'updated' : 'created'} successfully`, productId });
  } catch (err) {
    console.error('Save product error:', err);
    res.status(500).json({ success: false, message: 'Failed to save product' });
  }
});

// Delete Product
router.delete('/products/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// 3. Category Management
router.post('/categories', async (req, res) => {
  try {
    const { id, name, image, display_order, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (id) {
      await dbAsync.run('UPDATE categories SET name=?, slug=?, image=?, display_order=?, status=? WHERE id=?', [name, slug, image || '', display_order || 0, status || 'active', id]);
    } else {
      await dbAsync.run('INSERT INTO categories (name, slug, image, display_order, status) VALUES (?, ?, ?, ?, ?)', [name, slug, image || '', display_order || 0, status || 'active']);
    }

    res.json({ success: true, message: 'Category saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// 4. Inventory Management & Adjustments
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await dbAsync.all(`
      SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.stock ASC
    `);

    for (let item of inventory) {
      item.variants = await dbAsync.all('SELECT * FROM product_variants WHERE product_id = ?', [item.id]);
    }

    const logs = await dbAsync.all('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 20');

    res.json({ success: true, inventory, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
});

router.post('/inventory/adjust', async (req, res) => {
  try {
    const { productId, variantId, newStock, note } = req.body;
    if (productId === undefined || newStock === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and new stock value required' });
    }

    const oldProduct = await dbAsync.get('SELECT stock FROM products WHERE id = ?', [productId]);
    const diff = newStock - (oldProduct ? oldProduct.stock : 0);

    await dbAsync.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);

    if (variantId) {
      await dbAsync.run('UPDATE product_variants SET stock = ? WHERE id = ?', [newStock, variantId]);
    }

    await dbAsync.run(`
      INSERT INTO inventory_logs (product_id, variant_id, change_qty, type, reference_id, note)
      VALUES (?, ?, ?, 'manual_adjustment', 'ADMIN', ?)
    `, [productId, variantId || null, diff, note || 'Manual stock update']);

    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to adjust stock' });
  }
});

// 5. Order Management & Returns
router.get('/orders', async (req, res) => {
  try {
    const { status, search } = req.query;
    let whereClause = [];
    let params = [];

    if (status) {
      whereClause.push("order_status = ?");
      params.push(status);
    }

    if (search) {
      whereClause.push("(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereString = whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : '';
    const orders = await dbAsync.all(`SELECT * FROM orders ${whereString} ORDER BY created_at DESC`, params);

    for (let o of orders) {
      o.items = await dbAsync.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin orders' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { order_status, tracking_number, courier_name, comment } = req.body;
    const order = await dbAsync.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    let payment_status = order.payment_status;
    if (order_status === 'delivered' && order.payment_method === 'COD') {
      payment_status = 'paid';
    }

    await dbAsync.run(`
      UPDATE orders SET 
        order_status = ?, 
        payment_status = ?,
        tracking_number = COALESCE(?, tracking_number),
        courier_name = COALESCE(?, courier_name)
      WHERE id = ?
    `, [order_status, payment_status, tracking_number || null, courier_name || null, req.params.id]);

    await dbAsync.run(`
      INSERT INTO order_status_history (order_id, status, comment)
      VALUES (?, ?, ?)
    `, [req.params.id, order_status, comment || `Status updated to ${order_status} by admin`]);

    res.json({ success: true, message: `Order status updated to ${order_status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Returns & Refunds
router.get('/returns', async (req, res) => {
  try {
    const returnsList = await dbAsync.all(`
      SELECT r.*, o.order_number, u.name as customer_name, u.email as customer_email, p.name as product_name
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, returns: returnsList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch returns' });
  }
});

router.put('/returns/:id', async (req, res) => {
  try {
    const { status, admin_comment } = req.body;
    await dbAsync.run('UPDATE returns SET status = ?, admin_comment = ? WHERE id = ?', [status, admin_comment || '', req.params.id]);
    res.json({ success: true, message: `Return request ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update return request' });
  }
});

// 6. Customer Management
router.get('/customers', async (req, res) => {
  try {
    const customers = await dbAsync.all(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             COUNT(o.id) as total_orders, COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'cancelled'
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

router.put('/customers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await dbAsync.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Customer status changed to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update customer status' });
  }
});

// 7. Coupon Management
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await dbAsync.all('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { id, code, discount_type, discount_value, min_order_value, max_discount_amount, status } = req.body;
    if (!code || !discount_value) return res.status(400).json({ success: false, message: 'Code and discount value required' });

    if (id) {
      await dbAsync.run(`
        UPDATE coupons SET code=?, discount_type=?, discount_value=?, min_order_value=?, max_discount_amount=?, status=?
        WHERE id=?
      `, [code.toUpperCase(), discount_type, discount_value, min_order_value || 0, max_discount_amount || 0, status || 'active', id]);
    } else {
      await dbAsync.run(`
        INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount_amount, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [code.toUpperCase(), discount_type, discount_value, min_order_value || 0, max_discount_amount || 0, status || 'active']);
    }

    res.json({ success: true, message: 'Coupon saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save coupon' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
});

// 8. Banners Management
router.get('/banners', async (req, res) => {
  try {
    const banners = await dbAsync.all('SELECT * FROM banners ORDER BY display_order ASC');
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const { id, title, subtitle, image, button_text, button_link, display_order, status } = req.body;
    if (!title || !image) return res.status(400).json({ success: false, message: 'Title and image are required' });

    if (id) {
      await dbAsync.run(`
        UPDATE banners SET title=?, subtitle=?, image=?, button_text=?, button_link=?, display_order=?, status=?
        WHERE id=?
      `, [title, subtitle || '', image, button_text || 'Shop Now', button_link || '/shop', display_order || 0, status || 'active', id]);
    } else {
      await dbAsync.run(`
        INSERT INTO banners (title, subtitle, image, button_text, button_link, display_order, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, subtitle || '', image, button_text || 'Shop Now', button_link || '/shop', display_order || 0, status || 'active']);
    }

    res.json({ success: true, message: 'Banner saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save banner' });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
});

// 9. Store Settings Management
router.post('/settings', async (req, res) => {
  try {
    const settings = req.body; // Key-value pair object
    const { getEngine } = require('../db/database');
    const engine = await getEngine();

    for (const key in settings) {
      const val = String(settings[key] ?? '');
      if (engine.type === 'mysql') {
        await dbAsync.run('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)', [key, val]);
      } else {
        await dbAsync.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, val]);
      }
    }
    res.json({ success: true, message: 'Store settings updated successfully' });
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to save store settings' });
  }
});

// 10. Reviews Moderation
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await dbAsync.all(`
      SELECT r.*, p.name as product_name 
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

router.put('/reviews/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await dbAsync.run('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Review status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to moderate review' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

module.exports = router;
