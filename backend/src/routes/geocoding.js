const express = require('express');
const { body, validationResult } = require('express-validator');
const { geocodeAddress, reverseGeocode } = require('../utils/geocoding');

const router = express.Router();

// Geocode address to coordinates
router.post('/address', 
  [
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { address } = req.body;

      const coordinates = await geocodeAddress(address);

      if (!coordinates) {
        return res.status(400).json({
          success: false,
          message: 'Could not geocode the provided address'
        });
      }

      res.json({
        success: true,
        data: coordinates
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to geocode address'
      });
    }
  }
);

// Reverse geocode coordinates to address
router.post('/reverse',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { latitude, longitude } = req.body;

      const address = await reverseGeocode(latitude, longitude);

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Could not reverse geocode the provided coordinates'
        });
      }

      res.json({
        success: true,
        data: { address }
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reverse geocode coordinates'
      });
    }
  }
);

module.exports = router; 