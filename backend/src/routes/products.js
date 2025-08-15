const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { authenticateToken, requireShopOwner, requireShopOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      shopId,
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort = 'name',
      order = 'asc'
    } = req.query;

    const query = { isAvailable: true };
    
    // Shop filter
    if (shopId) {
      query.shop = shopId;
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Stock filter
    if (inStock === 'true') {
      query.$or = [
        { 'inventory.isUnlimited': true },
        { 'inventory.quantity': { $gt: 0 } }
      ];
    }
    
    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price':
        sortOption = { price: order === 'desc' ? -1 : 1 };
        break;
      case 'rating':
        sortOption = { averageRating: order === 'desc' ? -1 : 1 };
        break;
      case 'created':
        sortOption = { createdAt: order === 'desc' ? -1 : 1 };
        break;
      case 'name':
      default:
        sortOption = { name: order === 'desc' ? -1 : 1 };
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('shop', 'name category location')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name category location contact')
      .populate('reviews.user', 'firstName lastName username avatar');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// Create new product (shop owner only)
router.post('/',
  authenticateToken,
  requireShopOwner,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('subcategory').optional().trim(),
    body('shop').isMongoId().withMessage('Valid shop ID is required'),
    body('inventory.quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('inventory.unit').optional().isIn(['piece', 'kg', 'lb', 'g', 'oz', 'liter', 'gallon', 'dozen', 'bunch']).withMessage('Invalid unit'),
    body('inventory.lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
    body('inventory.isUnlimited').optional().isBoolean().withMessage('isUnlimited must be a boolean'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('attributes').optional().isArray().withMessage('Attributes must be an array'),
    body('dietary.isGlutenFree').optional().isBoolean(),
    body('dietary.isVegan').optional().isBoolean(),
    body('dietary.isVegetarian').optional().isBoolean(),
    body('dietary.isOrganic').optional().isBoolean(),
    body('dietary.isHalal').optional().isBoolean(),
    body('dietary.isKosher').optional().isBoolean(),
    body('dietary.isDairyFree').optional().isBoolean(),
    body('dietary.isNutFree').optional().isBoolean(),
    body('allergens').optional().isArray().withMessage('Allergens must be an array'),
    body('features').optional().isArray().withMessage('Features must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }
      
      // Verify shop ownership
      if (!req.user.shops.includes(req.body.shop) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only add products to your own shops'
        });
      }
      
      // Verify shop exists and is active
      const shop = await Shop.findById(req.body.shop);
      if (!shop || !shop.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Shop not found or inactive'
        });
      }
      
      const product = new Product(req.body);
      await product.save();
      
      const populatedProduct = await Product.findById(product._id)
        .populate('shop', 'name category location');
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: populatedProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product'
      });
    }
  }
);

// Update product (shop owner only)
router.put('/:id',
  authenticateToken,
  requireShopOwner,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('subcategory').optional().trim(),
    body('inventory.quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('inventory.unit').optional().isIn(['piece', 'kg', 'lb', 'g', 'oz', 'liter', 'gallon', 'dozen', 'bunch']).withMessage('Invalid unit'),
    body('inventory.lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
    body('inventory.isUnlimited').optional().isBoolean().withMessage('isUnlimited must be a boolean'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('attributes').optional().isArray().withMessage('Attributes must be an array'),
    body('dietary').optional().isObject().withMessage('Dietary must be an object'),
    body('allergens').optional().isArray().withMessage('Allergens must be an array'),
    body('features').optional().isArray().withMessage('Features must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }
      
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Verify shop ownership
      if (!req.user.shops.includes(product.shop) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only update products from your own shops'
        });
      }
      
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('shop', 'name category location');
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product'
      });
    }
  }
);

// Delete product (shop owner only)
router.delete('/:id',
  authenticateToken,
  requireShopOwner,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Verify shop ownership
      if (!req.user.shops.includes(product.shop) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete products from your own shops'
        });
      }
      
      await Product.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product'
      });
    }
  }
);

// Add product review (authenticated users)
router.post('/:id/reviews',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }
      
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Check if user already reviewed this product
      const existingReview = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
      );
      
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }
      
      await product.addReview(req.user._id, req.body.rating, req.body.comment);
      
      const updatedProduct = await Product.findById(req.params.id)
        .populate('reviews.user', 'firstName lastName username avatar');
      
      res.json({
        success: true,
        message: 'Review added successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding review'
      });
    }
  }
);

// Update product inventory (shop owner only)
router.patch('/:id/inventory',
  authenticateToken,
  requireShopOwner,
  [
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('isUnlimited').optional().isBoolean().withMessage('isUnlimited must be a boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }
      
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Verify shop ownership
      if (!req.user.shops.includes(product.shop) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only update inventory for your own products'
        });
      }
      
      const updateData = {};
      if (req.body.quantity !== undefined) {
        updateData['inventory.quantity'] = req.body.quantity;
      }
      if (req.body.isUnlimited !== undefined) {
        updateData['inventory.isUnlimited'] = req.body.isUnlimited;
      }
      
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('shop', 'name category location');
      
      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating inventory'
      });
    }
  }
);

// Get products by shop (public)
router.get('/shop/:shopId', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sort = 'name',
      order = 'asc'
    } = req.query;

    const query = { 
      shop: req.params.shopId,
      isAvailable: true 
    };
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price':
        sortOption = { price: order === 'desc' ? -1 : 1 };
        break;
      case 'rating':
        sortOption = { averageRating: order === 'desc' ? -1 : 1 };
        break;
      case 'created':
        sortOption = { createdAt: order === 'desc' ? -1 : 1 };
        break;
      case 'name':
      default:
        sortOption = { name: order === 'desc' ? -1 : 1 };
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop products'
    });
  }
});

module.exports = router; 