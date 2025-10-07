const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Login route
router.post('/login', authController.login);

// Get current user profile (requires authentication)
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;