const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategory.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Get all subcategories
router.get('/', subcategoryController.getAllSubCategories);

// Get subcategory by ID
router.get('/:id', subcategoryController.getSubCategoryById);

// Create a new subcategory (admin only)
router.post('/', verifyToken, verifyAdmin, subcategoryController.createSubCategory);

// Update a subcategory (admin only)
router.put('/:id', verifyToken, verifyAdmin, subcategoryController.updateSubCategory);

// Delete a subcategory (admin only)
router.delete('/:id', verifyToken, verifyAdmin, subcategoryController.deleteSubCategory);

module.exports = router;