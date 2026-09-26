const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Setup Multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/upload - Upload Single Image to Cloudinary (Base64 or Multipart)
router.post('/', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    let fileStr = req.body.image; // Base64 data URL if sent as body
    
    if (req.file) {
      // Convert buffer to Data URI string
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      fileStr = `data:${req.file.mimetype};base64,${b64}`;
    }

    if (!fileStr) {
      return res.status(400).json({ success: false, message: 'No file or image data provided' });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: 'radhamav_store',
      resource_type: 'auto'
    });

    res.json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload image to Cloudinary'
    });
  }
});

// POST /api/upload/multiple - Upload Multiple Images to Cloudinary
router.post('/multiple', authenticateToken, requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const imagesBody = req.body.images || [];
    const urls = [];

    if (files.length > 0) {
      for (const file of files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'radhamav_store',
          resource_type: 'auto'
        });
        urls.push(result.secure_url);
      }
    } else if (Array.isArray(imagesBody) && imagesBody.length > 0) {
      for (const imgStr of imagesBody) {
        if (imgStr.startsWith('http')) {
          urls.push(imgStr);
        } else {
          const result = await cloudinary.uploader.upload(imgStr, {
            folder: 'radhamav_store',
            resource_type: 'auto'
          });
          urls.push(result.secure_url);
        }
      }
    }

    res.json({
      success: true,
      message: `${urls.length} images uploaded to Cloudinary`,
      urls
    });
  } catch (err) {
    console.error('Cloudinary multiple upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
});

module.exports = router;
