const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
router.post('/image',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary with optimized transformations
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'local-shop',
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { strip: true } // Remove metadata for smaller file size
        ],
        eager: [
          { width: 400, height: 300, crop: 'limit', quality: 'auto:good' },
          { width: 200, height: 150, crop: 'limit', quality: 'auto:good' }
        ],
        eager_async: true,
        eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL
      });

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image'
      });
    }
  }
);

// Upload multiple images
router.post('/images',
  authenticateToken,
  upload.array('images', 10), // Max 10 images
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
      }

      const uploadPromises = req.files.map(async (file) => {
        // Convert buffer to base64
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        // Upload to Cloudinary with optimized transformations
        return await cloudinary.uploader.upload(dataURI, {
          folder: 'local-shop',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            { strip: true } // Remove metadata for smaller file size
          ],
          eager: [
            { width: 400, height: 300, crop: 'limit', quality: 'auto:good' },
            { width: 200, height: 150, crop: 'limit', quality: 'auto:good' }
          ],
          eager_async: true,
          eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL
        });
      });

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }));

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading images'
      });
    }
  }
);

// Delete image from Cloudinary
router.delete('/image/:publicId',
  authenticateToken,
  async (req, res) => {
    try {
      const { publicId } = req.params;

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to delete image'
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting image'
      });
    }
  }
);

// Upload avatar image
router.post('/avatar',
  authenticateToken,
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No avatar image provided'
        });
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary with avatar-specific transformations
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'local-shop/avatars',
        resource_type: 'auto',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        }
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading avatar'
      });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

module.exports = router; 