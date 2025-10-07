const db = require('../config/database');

// Get all positions
exports.getAllPositions = async (req, res) => {
  try {
    const subcategoryId = req.query.subcategory_id;
    let query = 'SELECT p.*, s.name as subcategory_name FROM positions p LEFT JOIN subcategories s ON p.subcategory_id = s.id';
    let params = [];
    
    if (subcategoryId) {
      query += ' WHERE p.subcategory_id = ?';
      params.push(subcategoryId);
    }
    
    query += ' ORDER BY p.name';
    
    const [positions] = await db.execute(query, params);
    
    res.status(200).json({
      success: true,
      data: positions,
      message: 'Positions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve positions',
      error: error.message
    });
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [positions] = await db.execute(
      'SELECT p.*, s.name as subcategory_name FROM positions p LEFT JOIN subcategories s ON p.subcategory_id = s.id WHERE p.id = ?',
      [id]
    );
    
    if (positions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: positions[0],
      message: 'Position retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve position',
      error: error.message
    });
  }
};

// Create a new position
exports.createPosition = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { name, subcategory_id } = req.body;
    
    if (!name || !subcategory_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and subcategory_id are required'
      });
    }
    
    // Check if subcategory exists
    const [subcategories] = await db.execute('SELECT * FROM subcategories WHERE id = ?', [subcategory_id]);
    if (subcategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    // Check if position with same name already exists in this subcategory
    const [existingPositions] = await db.execute(
      'SELECT * FROM positions WHERE name = ? AND subcategory_id = ?',
      [name, subcategory_id]
    );
    
    if (existingPositions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Position with this name already exists in this subcategory'
      });
    }
    
    // Create new position
    const [result] = await db.execute(
      'INSERT INTO positions (name, subcategory_id) VALUES (?, ?)',
      [name, subcategory_id]
    );
    
    const newPositionId = result.insertId;
    
    res.status(201).json({
      success: true,
      data: {
        id: newPositionId,
        name,
        subcategory_id
      },
      message: 'Position created successfully'
    });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create position',
      error: error.message
    });
  }
};

// Update a position
exports.updatePosition = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { id } = req.params;
    const { name, subcategory_id } = req.body;
    
    if (!name || !subcategory_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and subcategory_id are required'
      });
    }
    
    // Check if position exists
    const [positions] = await db.execute('SELECT * FROM positions WHERE id = ?', [id]);
    if (positions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    // Check if subcategory exists
    const [subcategories] = await db.execute('SELECT * FROM subcategories WHERE id = ?', [subcategory_id]);
    if (subcategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    // Check if another position with same name already exists in this subcategory
    const [existingPositions] = await db.execute(
      'SELECT * FROM positions WHERE name = ? AND subcategory_id = ? AND id != ?',
      [name, subcategory_id, id]
    );
    
    if (existingPositions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Another position with this name already exists in this subcategory'
      });
    }
    
    // Update position
    await db.execute(
      'UPDATE positions SET name = ?, subcategory_id = ? WHERE id = ?',
      [name, subcategory_id, id]
    );
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        name,
        subcategory_id
      },
      message: 'Position updated successfully'
    });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update position',
      error: error.message
    });
  }
};

// Delete a position
exports.deletePosition = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }
    
    const { id } = req.params;
    
    // Check if position exists
    const [positions] = await db.execute('SELECT * FROM positions WHERE id = ?', [id]);
    if (positions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Position not found'
      });
    }
    
    // Check if any archives are using this position
    const [archives] = await db.execute('SELECT * FROM archives WHERE position_id = ?', [id]);
    if (archives.length > 0) {
      // Update archives to remove reference to this position
      await db.execute('UPDATE archives SET position_id = NULL WHERE position_id = ?', [id]);
    }
    
    // Delete position
    await db.execute('DELETE FROM positions WHERE id = ?', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete position',
      error: error.message
    });
  }
};