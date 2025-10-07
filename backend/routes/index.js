const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const archiveRoutes = require('./archive.routes');
const categoryRoutes = require('./category.routes');
const subcategoryRoutes = require('./subcategory.routes');
const positionRoutes = require('./position.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/archives', archiveRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/positions', positionRoutes);

module.exports = router;