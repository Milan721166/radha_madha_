const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register Customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await dbAsync.run(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, phone || '', 'customer']
    );

    const token = jwt.sign(
      { id: result.id, name, email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: result.id, name, email, role: 'customer', phone }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login User/Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await dbAsync.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Get Current Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbAsync.get('SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const addresses = await dbAsync.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [user.id]);

    res.json({
      success: true,
      user,
      addresses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

// Add / Update Address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const { id, full_name, phone, house_flat, street, area, city, state, pincode, country, is_default } = req.body;
    if (!full_name || !phone || !house_flat || !street || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Please fill all required address fields' });
    }

    if (is_default) {
      await dbAsync.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    if (id) {
      await dbAsync.run(`
        UPDATE addresses SET full_name=?, phone=?, house_flat=?, street=?, area=?, city=?, state=?, pincode=?, country=?, is_default=?
        WHERE id=? AND user_id=?
      `, [full_name, phone, house_flat, street, area || '', city, state, pincode, country || 'India', is_default ? 1 : 0, id, req.user.id]);
    } else {
      await dbAsync.run(`
        INSERT INTO addresses (user_id, full_name, phone, house_flat, street, area, city, state, pincode, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [req.user.id, full_name, phone, house_flat, street, area || '', city, state, pincode, country || 'India', is_default ? 1 : 0]);
    }

    const addresses = await dbAsync.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id]);
    res.json({ success: true, message: 'Address saved successfully', addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save address' });
  }
});

// Delete Address
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    const addresses = await dbAsync.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id]);
    res.json({ success: true, message: 'Address removed', addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

module.exports = router;
