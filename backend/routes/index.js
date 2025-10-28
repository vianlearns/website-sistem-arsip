const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const archiveRoutes = require('./archive.routes');
const letterRoutes = require('./letter.routes');
const educationRoutes = require('./education.routes');
const staticFieldRoutes = require('./staticField.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/archives', archiveRoutes);
router.use('/letters', letterRoutes);
router.use('/education', educationRoutes);
router.use('/static-fields', staticFieldRoutes);

module.exports = router;