const db = require('../config/database');

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
  try {
    const categoryId = req.query.category_id;
    let query = 'SELECT s.*, c.name as category_name FROM subcategories s LEFT JOIN categories c ON s.category_id = c.id';
    let params = [];
    
    if (categoryId) {
      query += ' WHERE s.category_id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY s.name';
    
    const [subcategories] = await db.execute(query, params);
    
    res.status(200).json({
      success: true,
      data: subcategories,
      message: 'Subcategories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategories',
      error: error.message
    });
  }
};

// Get subcategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [subcategories] = await db.execute(
      'SELECT s.*, c.name as category_name FROM subcategories s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = ?',
      [id]
    );
    
    if (subcategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subcategories[0],
      message: 'Subcategory retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategory',
      error: error.message
    });
  }
};

// Create a new subcategory
exports.createSubCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { name, category_id } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and category_id are required'
      });
    }
    
    // Check if category exists
    const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if subcategory with same name already exists in this category
    const [existingSubcategories] = await db.execute(
      'SELECT * FROM subcategories WHERE name = ? AND category_id = ?',
      [name, category_id]
    );
    
    if (existingSubcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      });
    }
    
    // Create new subcategory
    const [result] = await db.execute(
      'INSERT INTO subcategories (name, category_id) VALUES (?, ?)',
      [name, category_id]
    );
    
    const newSubCategoryId = result.insertId;
    
    // Get the newly created subcategory
    const [newSubCategory] = await db.execute(
      'SELECT s.*, c.name as category_name FROM subcategories s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = ?',
      [newSubCategoryId]
    );
    
    res.status(201).json({
      success: true,
      data: newSubCategory[0],
      message: 'Subcategory created successfully'
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: error.message
    });
  }
};

// Update a subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { id } = req.params;
    const { name, category_id } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and category_id are required'
      });
    }
    
    // Check if subcategory exists
    const [subcategories] = await db.execute('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (subcategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    // Check if category exists
    const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if subcategory with same name already exists in this category (excluding current subcategory)
    const [existingSubcategories] = await db.execute(
      'SELECT * FROM subcategories WHERE name = ? AND category_id = ? AND id != ?',
      [name, category_id, id]
    );
    
    if (existingSubcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      });
    }
    
    // Update subcategory
    await db.execute(
      'UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?',
      [name, category_id, id]
    );
    
    // Get the updated subcategory
    const [updatedSubCategory] = await db.execute(
      'SELECT s.*, c.name as category_name FROM subcategories s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      data: updatedSubCategory[0],
      message: 'Subcategory updated successfully'
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory',
      error: error.message
    });
  }
};

// Delete a subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { id } = req.params;
    
    // Check if subcategory exists
    const [subcategories] = await db.execute('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (subcategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    // Check if subcategory is being used by any archives
    const [archives] = await db.execute('SELECT * FROM archives WHERE subcategory_id = ?', [id]);
    if (archives.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subcategory as it is being used by archives'
      });
    }
    
    // Delete subcategory
    await db.execute('DELETE FROM subcategories WHERE id = ?', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: error.message
    });
  }
};