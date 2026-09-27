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

// Import OTP Service
const { sendOtpViaApiTxt } = require('../services/otpService');

// Helper to format phone
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  return cleaned;
}

// Send OTP via APITxT
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = cleanPhoneNumber(phone);

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    // Generate 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Format to standard MySQL/SQLite DATETIME string: YYYY-MM-DD HH:mm:ss
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    // Save to database
    await dbAsync.run(
      'INSERT INTO otps (phone, otp, expires_at, attempts, verified) VALUES (?, ?, ?, 0, 0)',
      [cleanPhone, generatedOtp, expiresAt]
    );

    // Dispatch via APITxT Service
    const result = await sendOtpViaApiTxt(cleanPhone, generatedOtp);

    res.json({
      success: true,
      message: result.message || 'OTP sent successfully',
      phone: cleanPhone,
      mode: result.mode
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// Helper to check if OTP is expired (supports Date objects, ISO strings & MySQL dates)
function isOtpExpired(expiresAtVal, createdAtVal) {
  try {
    let expTime = 0;
    if (expiresAtVal instanceof Date) {
      expTime = expiresAtVal.getTime();
    } else if (typeof expiresAtVal === 'number') {
      expTime = expiresAtVal;
    } else if (expiresAtVal) {
      const str = String(expiresAtVal).trim();
      const normalizedStr = str.includes('T')
        ? (str.endsWith('Z') ? str : str + 'Z')
        : str.replace(' ', 'T') + 'Z';
      const parsed = new Date(normalizedStr);
      expTime = !isNaN(parsed.getTime()) ? parsed.getTime() : new Date(str).getTime();
    }
    
    // If valid timestamp comparison
    if (expTime > 0 && !isNaN(expTime)) {
      return Date.now() > expTime;
    }

    // Fallback using created_at (valid for 10 mins from creation)
    if (createdAtVal) {
      let createdTime = 0;
      if (createdAtVal instanceof Date) {
        createdTime = createdAtVal.getTime();
      } else if (typeof createdAtVal === 'number') {
        createdTime = createdAtVal;
      } else {
        const str = String(createdAtVal).trim();
        const normCreated = str.includes('T')
          ? (str.endsWith('Z') ? str : str + 'Z')
          : str.replace(' ', 'T') + 'Z';
        const parsed = new Date(normCreated);
        createdTime = !isNaN(parsed.getTime()) ? parsed.getTime() : new Date(str).getTime();
      }
      if (createdTime > 0 && !isNaN(createdTime)) {
        return (Date.now() - createdTime) > 10 * 60 * 1000;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Verify OTP Code
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = cleanPhoneNumber(phone);
    const inputOtp = (otp || '').trim();

    if (!cleanPhone || !inputOtp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP code are required' });
    }

    // Retrieve latest unverified OTP for this phone number
    const record = await dbAsync.get(
      'SELECT * FROM otps WHERE phone = ? AND verified = 0 ORDER BY id DESC',
      [cleanPhone]
    );

    if (!record) {
      return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new OTP.' });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Check expiration using timezone-aware helper
    if (isOtpExpired(record.expires_at, record.created_at)) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new one.' });
    }

    // Check code match
    if (record.otp === inputOtp) {
      await dbAsync.run('UPDATE otps SET verified = 1 WHERE id = ?', [record.id]);
      return res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      await dbAsync.run('UPDATE otps SET attempts = attempts + 1 WHERE id = ?', [record.id]);
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
});

// Login / Register via Verified OTP
router.post('/login-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    const cleanPhone = cleanPhoneNumber(phone);
    const inputOtp = (otp || '').trim();

    if (!cleanPhone || !inputOtp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    // Verify OTP first
    const record = await dbAsync.get(
      'SELECT * FROM otps WHERE phone = ? AND verified = 0 ORDER BY id DESC',
      [cleanPhone]
    );

    if (!record) {
      return res.status(400).json({ success: false, message: 'No active OTP found. Please request a new OTP.' });
    }

    if (isOtpExpired(record.expires_at, record.created_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    if (record.otp !== inputOtp) {
      await dbAsync.run('UPDATE otps SET attempts = attempts + 1 WHERE id = ?', [record.id]);
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Mark verified
    await dbAsync.run('UPDATE otps SET verified = 1 WHERE id = ?', [record.id]);

    // Find or Create User
    let user = await dbAsync.get('SELECT * FROM users WHERE phone = ? OR email = ?', [cleanPhone, `phone_${cleanPhone}@radhamav.com`]);

    if (!user) {
      const defaultName = name || `User_${cleanPhone.slice(-4)}`;
      const dummyEmail = `phone_${cleanPhone}@radhamav.com`;
      const hash = await bcrypt.hash(`OTP_PASS_${Date.now()}`, 10);

      const result = await dbAsync.run(
        'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [defaultName, dummyEmail, hash, cleanPhone, 'customer']
      );

      user = { id: result.id, name: defaultName, email: dummyEmail, phone: cleanPhone, role: 'customer' };
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful via Mobile OTP',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || cleanPhone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to process mobile login' });
  }
});

module.exports = router;

