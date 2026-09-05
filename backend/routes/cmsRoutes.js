const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db/database');

// GET Active Hero Banners
router.get('/banners', async (req, res) => {
  try {
    const banners = await dbAsync.all('SELECT * FROM banners WHERE status = "active" ORDER BY display_order ASC');
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

// GET CMS Page Content by Slug
router.get('/page/:slug', async (req, res) => {
  try {
    const page = await dbAsync.get('SELECT * FROM cms_pages WHERE slug = ?', [req.params.slug]);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch page' });
  }
});

// GET Store Public Settings
router.get('/settings', async (req, res) => {
  try {
    const settingsList = await dbAsync.all('SELECT key, value FROM settings');
    const settingsObj = {};
    settingsList.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json({ success: true, settings: settingsObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch store settings' });
  }
});

// POST Contact Form Submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields' });
    }

    await dbAsync.run(`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `, [name, email, phone || '', subject, message]);

    res.json({ success: true, message: 'Thank you for reaching out to Radhamav Fashions. Our customer concierge will respond shortly!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit message' });
  }
});

module.exports = router;
