const db = require('../config/database');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT * FROM categories 
      ORDER BY name ASC
    `);
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO categories (name, description) 
      VALUES (?, ?)
    `, [name.trim(), description || null]);
    
    const [category] = await db.execute(`
      SELECT * FROM categories WHERE id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Update Subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Subcategory name is required' });
    }
    
    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    
    const [subcategoryExists] = await db.execute('SELECT id FROM subcategories WHERE id = ?', [id]);
    if (subcategoryExists.length === 0) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    const [categoryExists] = await db.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categoryExists.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }
    
    await db.execute(`
      UPDATE subcategories 
      SET name = ?, description = ?, category_id = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name.trim(), description || null, category_id, id]);
    
    const [updatedSubcategory] = await db.execute(`
      SELECT s.*, c.name as category_name 
      FROM subcategories s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: updatedSubcategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subcategory name already exists for this category' });
    }
    console.error('Error updating subcategory:', error);
    res.status(500).json({ message: 'Server error while updating subcategory' });
  }
};

// Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [subcategoryExists] = await db.execute('SELECT id FROM subcategories WHERE id = ?', [id]);
    if (subcategoryExists.length === 0) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    // Check if subcategory has locations
    const [locations] = await db.execute('SELECT id FROM locations WHERE subcategory_id = ?', [id]);
    if (locations.length > 0) {
      return res.status(400).json({ message: 'Cannot delete subcategory with existing locations' });
    }
    
    await db.execute('DELETE FROM subcategories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Server error while deleting subcategory' });
  }
};

// Update Location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subcategory_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Location name is required' });
    }
    
    if (!subcategory_id) {
      return res.status(400).json({ message: 'Subcategory ID is required' });
    }
    
    const [locationExists] = await db.execute('SELECT id FROM locations WHERE id = ?', [id]);
    if (locationExists.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    const [subcategoryExists] = await db.execute('SELECT id FROM subcategories WHERE id = ?', [subcategory_id]);
    if (subcategoryExists.length === 0) {
      return res.status(400).json({ message: 'Subcategory not found' });
    }
    
    await db.execute(`
      UPDATE locations 
      SET name = ?, description = ?, subcategory_id = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name.trim(), description || null, subcategory_id, id]);
    
    const [updatedLocation] = await db.execute(`
      SELECT l.*, s.name as subcategory_name, c.name as category_name
      FROM locations l
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE l.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: updatedLocation[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Location name already exists for this subcategory' });
    }
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error while updating location' });
  }
};

// Delete Location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [locationExists] = await db.execute('SELECT id FROM locations WHERE id = ?', [id]);
    if (locationExists.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Check if location has cabinets
    const [cabinets] = await db.execute('SELECT id FROM cabinets WHERE location_id = ?', [id]);
    if (cabinets.length > 0) {
      return res.status(400).json({ message: 'Cannot delete location with existing cabinets' });
    }
    
    await db.execute('DELETE FROM locations WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Server error while deleting location' });
  }
};

// Update Cabinet
exports.updateCabinet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Cabinet name is required' });
    }
    
    if (!location_id) {
      return res.status(400).json({ message: 'Location ID is required' });
    }
    
    const [cabinetExists] = await db.execute('SELECT id FROM cabinets WHERE id = ?', [id]);
    if (cabinetExists.length === 0) {
      return res.status(404).json({ message: 'Cabinet not found' });
    }
    
    const [locationExists] = await db.execute('SELECT id FROM locations WHERE id = ?', [location_id]);
    if (locationExists.length === 0) {
      return res.status(400).json({ message: 'Location not found' });
    }
    
    await db.execute(`
      UPDATE cabinets 
      SET name = ?, description = ?, location_id = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name.trim(), description || null, location_id, id]);
    
    const [updatedCabinet] = await db.execute(`
      SELECT cab.*, l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM cabinets cab
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE cab.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Cabinet updated successfully',
      data: updatedCabinet[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cabinet name already exists for this location' });
    }
    console.error('Error updating cabinet:', error);
    res.status(500).json({ message: 'Server error while updating cabinet' });
  }
};

// Delete Cabinet
exports.deleteCabinet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [cabinetExists] = await db.execute('SELECT id FROM cabinets WHERE id = ?', [id]);
    if (cabinetExists.length === 0) {
      return res.status(404).json({ message: 'Cabinet not found' });
    }
    
    // Check if cabinet has shelves
    const [shelves] = await db.execute('SELECT id FROM shelves WHERE cabinet_id = ?', [id]);
    if (shelves.length > 0) {
      return res.status(400).json({ message: 'Cannot delete cabinet with existing shelves' });
    }
    
    await db.execute('DELETE FROM cabinets WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Cabinet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cabinet:', error);
    res.status(500).json({ message: 'Server error while deleting cabinet' });
  }
};

// Update Shelf
exports.updateShelf = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cabinet_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Shelf name is required' });
    }
    
    if (!cabinet_id) {
      return res.status(400).json({ message: 'Cabinet ID is required' });
    }
    
    const [shelfExists] = await db.execute('SELECT id FROM shelves WHERE id = ?', [id]);
    if (shelfExists.length === 0) {
      return res.status(404).json({ message: 'Shelf not found' });
    }
    
    const [cabinetExists] = await db.execute('SELECT id FROM cabinets WHERE id = ?', [cabinet_id]);
    if (cabinetExists.length === 0) {
      return res.status(400).json({ message: 'Cabinet not found' });
    }
    
    await db.execute(`
      UPDATE shelves 
      SET name = ?, description = ?, cabinet_id = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name.trim(), description || null, cabinet_id, id]);
    
    const [updatedShelf] = await db.execute(`
      SELECT sh.*, cab.name as cabinet_name, l.name as location_name, 
             s.name as subcategory_name, c.name as category_name
      FROM shelves sh
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE sh.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Shelf updated successfully',
      data: updatedShelf[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Shelf name already exists for this cabinet' });
    }
    console.error('Error updating shelf:', error);
    res.status(500).json({ message: 'Server error while updating shelf' });
  }
};

// Delete Shelf
exports.deleteShelf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [shelfExists] = await db.execute('SELECT id FROM shelves WHERE id = ?', [id]);
    if (shelfExists.length === 0) {
      return res.status(404).json({ message: 'Shelf not found' });
    }
    
    // Check if shelf has positions
    const [positions] = await db.execute('SELECT id FROM positions WHERE shelf_id = ?', [id]);
    if (positions.length > 0) {
      return res.status(400).json({ message: 'Cannot delete shelf with existing positions' });
    }
    
    await db.execute('DELETE FROM shelves WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Shelf deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shelf:', error);
    res.status(500).json({ message: 'Server error while deleting shelf' });
  }
};

// Update Position
exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, shelf_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Position name is required' });
    }
    
    if (!shelf_id) {
      return res.status(400).json({ message: 'Shelf ID is required' });
    }
    
    const [positionExists] = await db.execute('SELECT id FROM positions WHERE id = ?', [id]);
    if (positionExists.length === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    const [shelfExists] = await db.execute('SELECT id FROM shelves WHERE id = ?', [shelf_id]);
    if (shelfExists.length === 0) {
      return res.status(400).json({ message: 'Shelf not found' });
    }
    
    await db.execute(`
      UPDATE positions 
      SET name = ?, description = ?, shelf_id = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name.trim(), description || null, shelf_id, id]);
    
    const [updatedPosition] = await db.execute(`
      SELECT p.*, sh.name as shelf_name, cab.name as cabinet_name, 
             l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM positions p
      LEFT JOIN shelves sh ON p.shelf_id = sh.id
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Position updated successfully',
      data: updatedPosition[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Position name already exists for this shelf' });
    }
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Server error while updating position' });
  }
};

// Delete Position
exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [positionExists] = await db.execute('SELECT id FROM positions WHERE id = ?', [id]);
    if (positionExists.length === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Check if position is used in archives
    const [archives] = await db.execute('SELECT id FROM archives WHERE position_id = ?', [id]);
    if (archives.length > 0) {
      return res.status(400).json({ message: 'Cannot delete position with existing archives' });
    }
    
    await db.execute('DELETE FROM positions WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Server error while deleting position' });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [categoryExists] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (categoryExists.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await db.execute(`
      UPDATE categories 
      SET name = ?, description = ?, updated_at = NOW() 
      WHERE id = ?
    `, [name.trim(), description || null, id]);
    
    const [updatedCategory] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [categoryExists] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (categoryExists.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has subcategories
    const [subcategories] = await db.execute('SELECT id FROM subcategories WHERE category_id = ?', [id]);
    if (subcategories.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with existing subcategories' });
    }
    
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

// Get all subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const [subcategories] = await db.execute(`
      SELECT s.*, c.name as category_name 
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.name ASC
    `);
    
    res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error while fetching subcategories' });
  }
};

// Get subcategories by category ID
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const [subcategories] = await db.execute(`
      SELECT s.*, c.name as category_name 
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.category_id = ?
      ORDER BY s.name ASC
    `, [categoryId]);
    
    res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error while fetching subcategories' });
  }
};

// Create Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Subcategory name is required' });
    }
    
    if (!category_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    
    const [categoryExists] = await db.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categoryExists.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO subcategories (name, description, category_id) 
      VALUES (?, ?, ?)
    `, [name.trim(), description || null, category_id]);
    
    const [subcategory] = await db.execute(`
      SELECT s.*, c.name as category_name 
      FROM subcategories s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subcategory name already exists for this category' });
    }
    console.error('Error creating subcategory:', error);
    res.status(500).json({ message: 'Server error while creating subcategory' });
  }
};

// Get all locations
exports.getLocations = async (req, res) => {
  try {
    const [locations] = await db.execute(`
      SELECT l.*, s.name as subcategory_name, c.name as category_name
      FROM locations l
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY l.name ASC
    `);
    
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error while fetching locations' });
  }
};

// Get locations by subcategory ID
exports.getLocationsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    
    const [locations] = await db.execute(`
      SELECT l.*, s.name as subcategory_name, c.name as category_name
      FROM locations l
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE l.subcategory_id = ?
      ORDER BY l.name ASC
    `, [subcategoryId]);
    
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error while fetching locations' });
  }
};

// Create Location
exports.createLocation = async (req, res) => {
  try {
    const { name, description, subcategory_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Location name is required' });
    }
    
    if (!subcategory_id) {
      return res.status(400).json({ message: 'Subcategory ID is required' });
    }
    
    const [subcategoryExists] = await db.execute('SELECT id FROM subcategories WHERE id = ?', [subcategory_id]);
    if (subcategoryExists.length === 0) {
      return res.status(400).json({ message: 'Subcategory not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO locations (name, description, subcategory_id) 
      VALUES (?, ?, ?)
    `, [name.trim(), description || null, subcategory_id]);
    
    const [location] = await db.execute(`
      SELECT l.*, s.name as subcategory_name, c.name as category_name
      FROM locations l
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE l.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Location name already exists for this subcategory' });
    }
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Server error while creating location' });
  }
};

// Get all cabinets
exports.getCabinets = async (req, res) => {
  try {
    const [cabinets] = await db.execute(`
      SELECT cab.*, l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM cabinets cab
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY cab.name ASC
    `);
    
    res.status(200).json({
      success: true,
      data: cabinets
    });
  } catch (error) {
    console.error('Error fetching cabinets:', error);
    res.status(500).json({ message: 'Server error while fetching cabinets' });
  }
};

// Get cabinets by location ID
exports.getCabinetsByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const [cabinets] = await db.execute(`
      SELECT cab.*, l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM cabinets cab
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE cab.location_id = ?
      ORDER BY cab.name ASC
    `, [locationId]);
    
    res.status(200).json({
      success: true,
      data: cabinets
    });
  } catch (error) {
    console.error('Error fetching cabinets:', error);
    res.status(500).json({ message: 'Server error while fetching cabinets' });
  }
};

// Create Cabinet
exports.createCabinet = async (req, res) => {
  try {
    const { name, description, location_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Cabinet name is required' });
    }
    
    if (!location_id) {
      return res.status(400).json({ message: 'Location ID is required' });
    }
    
    const [locationExists] = await db.execute('SELECT id FROM locations WHERE id = ?', [location_id]);
    if (locationExists.length === 0) {
      return res.status(400).json({ message: 'Location not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO cabinets (name, description, location_id) 
      VALUES (?, ?, ?)
    `, [name.trim(), description || null, location_id]);
    
    const [cabinet] = await db.execute(`
      SELECT cab.*, l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM cabinets cab
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE cab.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Cabinet created successfully',
      data: cabinet[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cabinet name already exists for this location' });
    }
    console.error('Error creating cabinet:', error);
    res.status(500).json({ message: 'Server error while creating cabinet' });
  }
};

// Get all shelves
exports.getShelves = async (req, res) => {
  try {
    const [shelves] = await db.execute(`
      SELECT sh.*, cab.name as cabinet_name, l.name as location_name, 
             s.name as subcategory_name, c.name as category_name
      FROM shelves sh
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY sh.name ASC
    `);
    
    res.status(200).json({
      success: true,
      data: shelves
    });
  } catch (error) {
    console.error('Error fetching shelves:', error);
    res.status(500).json({ message: 'Server error while fetching shelves' });
  }
};

// Get shelves by cabinet ID
exports.getShelvesByCabinet = async (req, res) => {
  try {
    const { cabinetId } = req.params;
    
    const [shelves] = await db.execute(`
      SELECT sh.*, cab.name as cabinet_name, l.name as location_name, 
             s.name as subcategory_name, c.name as category_name
      FROM shelves sh
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE sh.cabinet_id = ?
      ORDER BY sh.name ASC
    `, [cabinetId]);
    
    res.status(200).json({
      success: true,
      data: shelves
    });
  } catch (error) {
    console.error('Error fetching shelves:', error);
    res.status(500).json({ message: 'Server error while fetching shelves' });
  }
};

// Get all positions
exports.getPositions = async (req, res) => {
  try {
    const [positions] = await db.execute(`
      SELECT p.*, sh.name as shelf_name, cab.name as cabinet_name, 
             l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM positions p
      LEFT JOIN shelves sh ON p.shelf_id = sh.id
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY p.name ASC
    `);
    
    res.status(200).json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ message: 'Server error while fetching positions' });
  }
};

// Get positions by shelf ID
exports.getPositionsByShelf = async (req, res) => {
  try {
    const { shelfId } = req.params;
    
    const [positions] = await db.execute(`
      SELECT p.*, sh.name as shelf_name, cab.name as cabinet_name, 
             l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM positions p
      LEFT JOIN shelves sh ON p.shelf_id = sh.id
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.shelf_id = ?
      ORDER BY p.name ASC
    `, [shelfId]);
    
    res.status(200).json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ message: 'Server error while fetching positions' });
  }
};

// Get complete hierarchy path for a position
exports.getHierarchyPath = async (req, res) => {
  try {
    const { positionId } = req.params;
    
    const [hierarchy] = await db.execute(`
      SELECT 
        c.id as category_id, c.name as category_name,
        s.id as subcategory_id, s.name as subcategory_name,
        l.id as location_id, l.name as location_name,
        cab.id as cabinet_id, cab.name as cabinet_name,
        sh.id as shelf_id, sh.name as shelf_name,
        p.id as position_id, p.name as position_name
      FROM positions p
      LEFT JOIN shelves sh ON p.shelf_id = sh.id
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.id = ?
    `, [positionId]);
    
    if (hierarchy.length === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json({
      success: true,
      data: hierarchy[0]
    });
  } catch (error) {
    console.error('Error fetching hierarchy path:', error);
    res.status(500).json({ message: 'Server error while fetching hierarchy path' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO categories (name, description) 
      VALUES (?, ?)
    `, [name, description || null]);
    
    const [category] = await db.execute(`
      SELECT * FROM categories WHERE id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Create new subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, category_id, description } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({ message: 'Subcategory name and category_id are required' });
    }
    
    // Check if category exists
    const [categoryExists] = await db.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categoryExists.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO subcategories (name, category_id, description) 
      VALUES (?, ?, ?)
    `, [name, category_id, description || null]);
    
    const [subcategory] = await db.execute(`
      SELECT s.*, c.name as category_name 
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subcategory name already exists for this category' });
    }
    console.error('Error creating subcategory:', error);
    res.status(500).json({ message: 'Server error while creating subcategory' });
  }
};

// Similar create functions for location, cabinet, shelf, and position
exports.createLocation = async (req, res) => {
  try {
    const { name, subcategory_id, description } = req.body;
    
    if (!name || !subcategory_id) {
      return res.status(400).json({ message: 'Location name and subcategory_id are required' });
    }
    
    const [subcategoryExists] = await db.execute('SELECT id FROM subcategories WHERE id = ?', [subcategory_id]);
    if (subcategoryExists.length === 0) {
      return res.status(400).json({ message: 'Subcategory not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO locations (name, subcategory_id, description) 
      VALUES (?, ?, ?)
    `, [name, subcategory_id, description || null]);
    
    const [location] = await db.execute(`
      SELECT l.*, s.name as subcategory_name, c.name as category_name
      FROM locations l
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE l.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Location name already exists for this subcategory' });
    }
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Server error while creating location' });
  }
};

exports.createCabinet = async (req, res) => {
  try {
    const { name, location_id, description } = req.body;
    
    if (!name || !location_id) {
      return res.status(400).json({ message: 'Cabinet name and location_id are required' });
    }
    
    const [locationExists] = await db.execute('SELECT id FROM locations WHERE id = ?', [location_id]);
    if (locationExists.length === 0) {
      return res.status(400).json({ message: 'Location not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO cabinets (name, location_id, description) 
      VALUES (?, ?, ?)
    `, [name, location_id, description || null]);
    
    const [cabinet] = await db.execute(`
      SELECT cab.*, l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM cabinets cab
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE cab.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Cabinet created successfully',
      data: cabinet[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cabinet name already exists for this location' });
    }
    console.error('Error creating cabinet:', error);
    res.status(500).json({ message: 'Server error while creating cabinet' });
  }
};

exports.createShelf = async (req, res) => {
  try {
    const { name, cabinet_id, description } = req.body;
    
    if (!name || !cabinet_id) {
      return res.status(400).json({ message: 'Shelf name and cabinet_id are required' });
    }
    
    const [cabinetExists] = await db.execute('SELECT id FROM cabinets WHERE id = ?', [cabinet_id]);
    if (cabinetExists.length === 0) {
      return res.status(400).json({ message: 'Cabinet not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO shelves (name, cabinet_id, description) 
      VALUES (?, ?, ?)
    `, [name, cabinet_id, description || null]);
    
    const [shelf] = await db.execute(`
      SELECT sh.*, cab.name as cabinet_name, l.name as location_name, 
             s.name as subcategory_name, c.name as category_name
      FROM shelves sh
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE sh.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Shelf created successfully',
      data: shelf[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Shelf name already exists for this cabinet' });
    }
    console.error('Error creating shelf:', error);
    res.status(500).json({ message: 'Server error while creating shelf' });
  }
};

exports.createPosition = async (req, res) => {
  try {
    const { name, shelf_id, description } = req.body;
    
    if (!name || !shelf_id) {
      return res.status(400).json({ message: 'Position name and shelf_id are required' });
    }
    
    const [shelfExists] = await db.execute('SELECT id FROM shelves WHERE id = ?', [shelf_id]);
    if (shelfExists.length === 0) {
      return res.status(400).json({ message: 'Shelf not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO positions (name, shelf_id, description) 
      VALUES (?, ?, ?)
    `, [name, shelf_id, description || null]);
    
    const [position] = await db.execute(`
      SELECT p.*, sh.name as shelf_name, cab.name as cabinet_name, 
             l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM positions p
      LEFT JOIN shelves sh ON p.shelf_id = sh.id
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: position[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Position name already exists for this shelf' });
    }
    console.error('Error creating position:', error);
    res.status(500).json({ message: 'Server error while creating position' });
  }
};

// UPDATE functions
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await db.execute(`
      UPDATE categories SET name = ?, description = ? WHERE id = ?
    `, [name, description || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const [category] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, description } = req.body;
    
    if (!name || !category_id) {
      return res.status(400).json({ message: 'Subcategory name and category_id are required' });
    }
    
    const [result] = await db.execute(`
      UPDATE subcategories SET name = ?, category_id = ?, description = ? WHERE id = ?
    `, [name, category_id, description || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    const [subcategory] = await db.execute(`
      SELECT s.*, c.name as category_name 
      FROM subcategories s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subcategory name already exists for this category' });
    }
    console.error('Error updating subcategory:', error);
    res.status(500).json({ message: 'Server error while updating subcategory' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategory_id, description } = req.body;
    
    if (!name || !subcategory_id) {
      return res.status(400).json({ message: 'Location name and subcategory_id are required' });
    }
    
    const [result] = await db.execute(`
      UPDATE locations SET name = ?, subcategory_id = ?, description = ? WHERE id = ?
    `, [name, subcategory_id, description || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    const [location] = await db.execute(`
      SELECT l.*, s.name as subcategory_name, c.name as category_name
      FROM locations l
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE l.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: location[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Location name already exists for this subcategory' });
    }
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error while updating location' });
  }
};

exports.updateCabinet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location_id, description } = req.body;
    
    if (!name || !location_id) {
      return res.status(400).json({ message: 'Cabinet name and location_id are required' });
    }
    
    const [result] = await db.execute(`
      UPDATE cabinets SET name = ?, location_id = ?, description = ? WHERE id = ?
    `, [name, location_id, description || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cabinet not found' });
    }
    
    const [cabinet] = await db.execute(`
      SELECT cab.*, l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM cabinets cab
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE cab.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Cabinet updated successfully',
      data: cabinet[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cabinet name already exists for this location' });
    }
    console.error('Error updating cabinet:', error);
    res.status(500).json({ message: 'Server error while updating cabinet' });
  }
};

exports.updateShelf = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cabinet_id, description } = req.body;
    
    if (!name || !cabinet_id) {
      return res.status(400).json({ message: 'Shelf name and cabinet_id are required' });
    }
    
    const [result] = await db.execute(`
      UPDATE shelves SET name = ?, cabinet_id = ?, description = ? WHERE id = ?
    `, [name, cabinet_id, description || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Shelf not found' });
    }
    
    const [shelf] = await db.execute(`
      SELECT sh.*, cab.name as cabinet_name, l.name as location_name, 
             s.name as subcategory_name, c.name as category_name
      FROM shelves sh
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE sh.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Shelf updated successfully',
      data: shelf[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Shelf name already exists for this cabinet' });
    }
    console.error('Error updating shelf:', error);
    res.status(500).json({ message: 'Server error while updating shelf' });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shelf_id, description } = req.body;
    
    if (!name || !shelf_id) {
      return res.status(400).json({ message: 'Position name and shelf_id are required' });
    }
    
    const [result] = await db.execute(`
      UPDATE positions SET name = ?, shelf_id = ?, description = ? WHERE id = ?
    `, [name, shelf_id, description || null, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    const [position] = await db.execute(`
      SELECT p.*, sh.name as shelf_name, cab.name as cabinet_name, 
             l.name as location_name, s.name as subcategory_name, c.name as category_name
      FROM positions p
      LEFT JOIN shelves sh ON p.shelf_id = sh.id
      LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
      LEFT JOIN locations l ON cab.location_id = l.id
      LEFT JOIN subcategories s ON l.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Position updated successfully',
      data: position[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Position name already exists for this shelf' });
    }
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Server error while updating position' });
  }
};

// DELETE functions
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [subcategories] = await db.execute('SELECT id FROM subcategories WHERE category_id = ?', [id]);
    if (subcategories.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with existing subcategories' });
    }
    
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [locations] = await db.execute('SELECT id FROM locations WHERE subcategory_id = ?', [id]);
    if (locations.length > 0) {
      return res.status(400).json({ message: 'Cannot delete subcategory with existing locations' });
    }
    
    const [result] = await db.execute('DELETE FROM subcategories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Server error while deleting subcategory' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [cabinets] = await db.execute('SELECT id FROM cabinets WHERE location_id = ?', [id]);
    if (cabinets.length > 0) {
      return res.status(400).json({ message: 'Cannot delete location with existing cabinets' });
    }
    
    const [result] = await db.execute('DELETE FROM locations WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Server error while deleting location' });
  }
};

exports.deleteCabinet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [shelves] = await db.execute('SELECT id FROM shelves WHERE cabinet_id = ?', [id]);
    if (shelves.length > 0) {
      return res.status(400).json({ message: 'Cannot delete cabinet with existing shelves' });
    }
    
    const [result] = await db.execute('DELETE FROM cabinets WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cabinet not found' });
    }
    
    res.json({
      success: true,
      message: 'Cabinet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cabinet:', error);
    res.status(500).json({ message: 'Server error while deleting cabinet' });
  }
};

exports.deleteShelf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [positions] = await db.execute('SELECT id FROM positions WHERE shelf_id = ?', [id]);
    if (positions.length > 0) {
      return res.status(400).json({ message: 'Cannot delete shelf with existing positions' });
    }
    
    const [result] = await db.execute('DELETE FROM shelves WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Shelf not found' });
    }
    
    res.json({
      success: true,
      message: 'Shelf deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shelf:', error);
    res.status(500).json({ message: 'Server error while deleting shelf' });
  }
};

exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute('DELETE FROM positions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json({
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Server error while deleting position' });
  }
};