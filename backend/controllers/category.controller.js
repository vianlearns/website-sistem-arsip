const db = require('../config/database');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    // Get all categories
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name');
    
    // Get all subcategories
    const [subcategories] = await db.execute('SELECT * FROM subcategories ORDER BY name');
    
    // Map subcategories to their parent categories
    const categoriesWithSubs = categories.map(category => {
      const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
      return {
        ...category,
        subcategories: categorySubcategories
      };
    });
    
    res.status(200).json({
      success: true,
      data: categoriesWithSubs,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching categories' 
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get subcategories for this category
    const [subcategories] = await db.execute('SELECT * FROM subcategories WHERE category_id = ? ORDER BY name', [id]);
    
    const categoryWithSubs = {
      ...categories[0],
      subcategories: subcategories
    };
    
    res.status(200).json(categoryWithSubs);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    // Only admin can create categories
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category already exists
    const [existingCategories] = await db.execute('SELECT * FROM categories WHERE name = ?', [name]);
    
    if (existingCategories.length > 0) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );
    
    res.status(201).json({ 
      message: 'Category created successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    // Only admin can update categories
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category exists
    const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if name is already taken by another category
    const [existingCategories] = await db.execute('SELECT * FROM categories WHERE name = ? AND id != ?', [name, id]);
    
    if (existingCategories.length > 0) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    await db.execute(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name, id]
    );
    
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    // Only admin can delete categories
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const { id } = req.params;
    
    // Check if category exists
    const [categories] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category is being used by any archives
    const [archives] = await db.execute('SELECT COUNT(*) as count FROM archives WHERE category_id = ?', [id]);
    
    if (archives[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is being used by archives. Update or delete those archives first.' 
      });
    }
    
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};