const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadBuffer, isConfigured } = require('../config/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/upload  (multipart form field "image") → { url }
router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!isConfigured) {
      return res.status(503).json({
        error:
          'Image uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server environment.',
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided (field: image)' });
    }
    const result = await uploadBuffer(req.file.buffer, {
      public_id: `note_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
      resource_type: 'image',
    });
    res.status(201).json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    if (err.message === 'Only image files are allowed') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;