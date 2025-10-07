const express = require('express');
const router = express.Router();
const positionController = require('../controllers/position.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Get all positions
router.get('/', positionController.getAllPositions);

// Get position by ID
router.get('/:id', positionController.getPositionById);

// Create a new position (admin only)
router.post('/', verifyToken, verifyAdmin, positionController.createPosition);

// Update a position (admin only)
router.put('/:id', verifyToken, verifyAdmin, positionController.updatePosition);

// Delete a position (admin only)
router.delete('/:id', verifyToken, verifyAdmin, positionController.deletePosition);

module.exports = router;