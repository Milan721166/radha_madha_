const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload buffer directly to Cloudinary using upload_stream with a 15-second timeout
function uploadStreamToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timed out after 15s'));
    }, 15000);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'radhamav_store',
        resource_type: 'auto'
      },
      (error, result) => {
        clearTimeout(timeout);
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Fallback: save buffer locally to /uploads/
function saveLocally(buffer, originalName) {
  const ext = (originalName && path.extname(originalName)) || '.jpg';
  const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${fileName}`;
}

// Setup Multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// POST /api/upload - Upload Single Image to Cloudinary with Local Fallback
router.post('/', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (req.file) {
      try {
        const uploadResponse = await uploadStreamToCloudinary(req.file.buffer, req.file.originalname);
        return res.json({
          success: true,
          message: 'Image uploaded to Cloudinary successfully',
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload notice:', cloudErr.message, '- saving locally as fallback');
        const localUrl = saveLocally(req.file.buffer, req.file.originalname);
        return res.json({
          success: true,
          message: 'Image uploaded successfully (Local storage fallback)',
          url: localUrl
        });
      }
    }

    if (req.body.image) {
      const fileStr = req.body.image;
      if (fileStr.startsWith('data:')) {
        const matches = fileStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const buffer = Buffer.from(matches[2], 'base64');
          try {
            const uploadResponse = await uploadStreamToCloudinary(buffer, 'image.jpg');
            return res.json({
              success: true,
              message: 'Image uploaded to Cloudinary successfully',
              url: uploadResponse.secure_url
            });
          } catch (cloudErr) {
            console.warn('Cloudinary upload notice:', cloudErr.message, '- saving locally as fallback');
            const localUrl = saveLocally(buffer, 'image.jpg');
            return res.json({
              success: true,
              message: 'Image uploaded successfully (Local storage fallback)',
              url: localUrl
            });
          }
        }
      }
      if (fileStr.startsWith('http')) {
        return res.json({ success: true, url: fileStr });
      }
    }

    return res.status(400).json({ success: false, message: 'No file or image data provided' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload image'
    });
  }
});

// POST /api/upload/multiple - Upload Multiple Images
router.post('/multiple', authenticateToken, requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const imagesBody = req.body.images || [];
    const urls = [];

    if (files.length > 0) {
      for (const file of files) {
        try {
          const result = await uploadStreamToCloudinary(file.buffer, file.originalname);
          urls.push(result.secure_url);
        } catch (cloudErr) {
          const localUrl = saveLocally(file.buffer, file.originalname);
          urls.push(localUrl);
        }
      }
    } else if (Array.isArray(imagesBody) && imagesBody.length > 0) {
      for (const imgStr of imagesBody) {
        if (imgStr.startsWith('http')) {
          urls.push(imgStr);
        } else if (imgStr.startsWith('data:')) {
          const matches = imgStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const buffer = Buffer.from(matches[2], 'base64');
            try {
              const result = await uploadStreamToCloudinary(buffer, 'image.jpg');
              urls.push(result.secure_url);
            } catch (e) {
              urls.push(saveLocally(buffer, 'image.jpg'));
            }
          }
        }
      }
    }

    res.json({
      success: true,
      message: `${urls.length} images uploaded successfully`,
      urls
    });
  } catch (err) {
    console.error('Multiple upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
});

module.exports = router;
