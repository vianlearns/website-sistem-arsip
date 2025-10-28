const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get all archives with pagination, search, and filtering
exports.getAllArchives = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, 
             c.name as category_name,
             s.name as subcategory_name,
             l.name as location_name,
             cab.name as cabinet_name,
             sh.name as shelf_name,
             p.name as position_name,
             admin.name as created_by_name
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN subcategories s ON a.subcategory_id = s.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN cabinets cab ON a.cabinet_id = cab.id
      LEFT JOIN shelves sh ON a.shelf_id = sh.id
      LEFT JOIN positions p ON a.position_id = p.id
      LEFT JOIN admin ON a.created_by = admin.id 
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add search condition if provided
    if (search) {
      query += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add order by and pagination
    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute query
    const [archives] = await db.execute(query, queryParams);
    
    // Add location hierarchy information for each archive
    for (let archive of archives) {
      archive.location_hierarchy = {
        category: archive.category_name,
        subcategory: archive.subcategory_name,
        location: archive.location_name,
        cabinet: archive.cabinet_name,
        shelf: archive.shelf_name,
        position: archive.position_name
      };
    }
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM archives a 
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: archives,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching archives:', error);
    res.status(500).json({ message: 'Server error while fetching archives' });
  }
};

// Get archive by ID
exports.getArchiveById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [archives] = await db.execute(`
      SELECT a.*, 
             c.name as category_name,
             s.name as subcategory_name,
             l.name as location_name,
             cab.name as cabinet_name,
             sh.name as shelf_name,
             p.name as position_name,
             admin.name as created_by_name
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN subcategories s ON a.subcategory_id = s.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN cabinets cab ON a.cabinet_id = cab.id
      LEFT JOIN shelves sh ON a.shelf_id = sh.id
      LEFT JOIN positions p ON a.position_id = p.id
      LEFT JOIN admin ON a.created_by = admin.id 
      WHERE a.id = ?
    `, [id]);
    
    if (archives.length === 0) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    
    const archive = archives[0];
    
    // Add location hierarchy information
    archive.location_hierarchy = {
      category: archive.category_name,
      subcategory: archive.subcategory_name,
      location: archive.location_name,
      cabinet: archive.cabinet_name,
      shelf: archive.shelf_name,
      position: archive.position_name
    };
    
    res.status(200).json(archive);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ message: 'Server error while fetching archive' });
  }
};

// Create new archive
exports.createArchive = async (req, res) => {
  try {
    const { title, description, date, image, category_id, subcategory_id, location_id, cabinet_id, shelf_id, position_id } = req.body;
    const created_by = req.userId;
    
    // Convert undefined to null for safe database operations
    const safeParams = {
      title: title || null,
      description: description || null,
      date: date || null,
      image: image || null,
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
      location_id: location_id || null,
      cabinet_id: cabinet_id || null,
      shelf_id: shelf_id || null,
      position_id: position_id || null
    };
    
    console.log('Creating archive with data:', safeParams);
    
    // Validate required fields
    if (!safeParams.title || !safeParams.description || !safeParams.date) {
      return res.status(400).json({ message: 'Title, description, and date are required' });
    }
    
    // Validate hierarchy consistency if provided
    if (safeParams.position_id) {
      const [positionCheck] = await db.execute(`
        SELECT p.id, p.shelf_id, sh.cabinet_id, cab.location_id, l.subcategory_id, s.category_id
        FROM positions p
        LEFT JOIN shelves sh ON p.shelf_id = sh.id
        LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
        LEFT JOIN locations l ON cab.location_id = l.id
        LEFT JOIN subcategories s ON l.subcategory_id = s.id
        WHERE p.id = ?
      `, [safeParams.position_id]);
      
      if (positionCheck.length === 0) {
        return res.status(400).json({ message: 'Invalid position_id: Position does not exist' });
      }
      
      const hierarchy = positionCheck[0];
      
      // Validate hierarchy consistency
      if (safeParams.shelf_id && safeParams.shelf_id != hierarchy.shelf_id) {
        return res.status(400).json({ message: 'Shelf ID does not match position hierarchy' });
      }
      if (safeParams.cabinet_id && safeParams.cabinet_id != hierarchy.cabinet_id) {
        return res.status(400).json({ message: 'Cabinet ID does not match position hierarchy' });
      }
      if (safeParams.location_id && safeParams.location_id != hierarchy.location_id) {
        return res.status(400).json({ message: 'Location ID does not match position hierarchy' });
      }
      if (safeParams.subcategory_id && safeParams.subcategory_id != hierarchy.subcategory_id) {
        return res.status(400).json({ message: 'Subcategory ID does not match position hierarchy' });
      }
      if (safeParams.category_id && safeParams.category_id != hierarchy.category_id) {
        return res.status(400).json({ message: 'Category ID does not match position hierarchy' });
      }
    }
    
    // Insert archive into archives table with new structure
    const [result] = await db.execute(`
      INSERT INTO archives (title, description, date, image, category_id, subcategory_id, location_id, cabinet_id, shelf_id, position_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      safeParams.title, 
      safeParams.description, 
      safeParams.date, 
      safeParams.image, 
      safeParams.category_id, 
      safeParams.subcategory_id, 
      safeParams.location_id, 
      safeParams.cabinet_id, 
      safeParams.shelf_id, 
      safeParams.position_id, 
      created_by
    ]);
    
    const archiveId = result.insertId;
    
    console.log('Archive created successfully with ID:', archiveId);
    
    // Fetch the created archive with hierarchy information
    const [createdArchive] = await db.execute(`
      SELECT a.*, 
             c.name as category_name,
             s.name as subcategory_name,
             l.name as location_name,
             cab.name as cabinet_name,
             sh.name as shelf_name,
             p.name as position_name,
             admin.name as created_by_name
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN subcategories s ON a.subcategory_id = s.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN cabinets cab ON a.cabinet_id = cab.id
      LEFT JOIN shelves sh ON a.shelf_id = sh.id
      LEFT JOIN positions p ON a.position_id = p.id
      LEFT JOIN admin ON a.created_by = admin.id 
      WHERE a.id = ?
    `, [archiveId]);
    
    const archive = createdArchive[0];
    
    // Add location hierarchy information
    archive.location_hierarchy = {
      category: archive.category_name,
      subcategory: archive.subcategory_name,
      location: archive.location_name,
      cabinet: archive.cabinet_name,
      shelf: archive.shelf_name,
      position: archive.position_name
    };
    
    res.status(201).json({
      success: true,
      message: 'Archive created successfully',
      data: archive
    });
  } catch (error) {
    console.error('Error creating archive:', error);
    res.status(500).json({ message: 'Server error while creating archive' });
  }
};


// Update archive
exports.updateArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      date, 
      image, 
      category_id, 
      subcategory_id, 
      location_id, 
      cabinet_id, 
      shelf_id, 
      position_id 
    } = req.body;
    
    // Convert undefined to null for database compatibility
    const safeParams = {
      title: title || null,
      description: description || null,
      date: date || null,
      image: image || null,
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
      location_id: location_id || null,
      cabinet_id: cabinet_id || null,
      shelf_id: shelf_id || null,
      position_id: position_id || null
    };
    
    console.log('Updating archive with data:', { id, ...safeParams });
    
    // Check if archive exists
    const [existingArchive] = await db.execute('SELECT * FROM archives WHERE id = ?', [id]);
    
    if (existingArchive.length === 0) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    
    // Validate hierarchy consistency if position_id is provided
    if (safeParams.position_id) {
      const [positionCheck] = await db.execute(`
        SELECT p.id, p.shelf_id, sh.cabinet_id, cab.location_id, l.subcategory_id, s.category_id
        FROM positions p
        LEFT JOIN shelves sh ON p.shelf_id = sh.id
        LEFT JOIN cabinets cab ON sh.cabinet_id = cab.id
        LEFT JOIN locations l ON cab.location_id = l.id
        LEFT JOIN subcategories s ON l.subcategory_id = s.id
        WHERE p.id = ?
      `, [safeParams.position_id]);
      
      if (positionCheck.length === 0) {
        return res.status(400).json({ message: 'Invalid position_id: Position does not exist' });
      }
      
      const hierarchy = positionCheck[0];
      
      // Validate hierarchy consistency
      if (safeParams.shelf_id && safeParams.shelf_id != hierarchy.shelf_id) {
        return res.status(400).json({ message: 'Shelf ID does not match position hierarchy' });
      }
      if (safeParams.cabinet_id && safeParams.cabinet_id != hierarchy.cabinet_id) {
        return res.status(400).json({ message: 'Cabinet ID does not match position hierarchy' });
      }
      if (safeParams.location_id && safeParams.location_id != hierarchy.location_id) {
        return res.status(400).json({ message: 'Location ID does not match position hierarchy' });
      }
      if (safeParams.subcategory_id && safeParams.subcategory_id != hierarchy.subcategory_id) {
        return res.status(400).json({ message: 'Subcategory ID does not match position hierarchy' });
      }
      if (safeParams.category_id && safeParams.category_id != hierarchy.category_id) {
        return res.status(400).json({ message: 'Category ID does not match position hierarchy' });
      }
    }
    
    // Update archive in archives table
    await db.execute(`
      UPDATE archives 
      SET title = ?, description = ?, date = ?, image = ?, category_id = ?, subcategory_id = ?, location_id = ?, cabinet_id = ?, shelf_id = ?, position_id = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      safeParams.title, 
      safeParams.description, 
      safeParams.date, 
      safeParams.image, 
      safeParams.category_id, 
      safeParams.subcategory_id, 
      safeParams.location_id, 
      safeParams.cabinet_id, 
      safeParams.shelf_id, 
      safeParams.position_id, 
      id
    ]);
    
    console.log('Archive updated successfully with ID:', id);
    
    // Fetch the updated archive with hierarchy information
    const [updatedArchive] = await db.execute(`
      SELECT a.*, 
             c.name as category_name,
             s.name as subcategory_name,
             l.name as location_name,
             cab.name as cabinet_name,
             sh.name as shelf_name,
             p.name as position_name,
             admin.name as created_by_name
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN subcategories s ON a.subcategory_id = s.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN cabinets cab ON a.cabinet_id = cab.id
      LEFT JOIN shelves sh ON a.shelf_id = sh.id
      LEFT JOIN positions p ON a.position_id = p.id
      LEFT JOIN admin ON a.created_by = admin.id 
      WHERE a.id = ?
    `, [id]);
    
    const archive = updatedArchive[0];
    
    // Add location hierarchy information
    archive.location_hierarchy = {
      category: archive.category_name,
      subcategory: archive.subcategory_name,
      location: archive.location_name,
      cabinet: archive.cabinet_name,
      shelf: archive.shelf_name,
      position: archive.position_name
    };
    
    res.status(200).json({
      success: true,
      message: 'Archive updated successfully',
      data: archive
    });
  } catch (error) {
    console.error('Error updating archive:', error);
    res.status(500).json({ message: 'Server error while updating archive' });
  }
};

// Delete archive
exports.deleteArchive = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if archive exists
    const [archives] = await db.execute('SELECT * FROM archives WHERE id = ?', [id]);
    
    if (archives.length === 0) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    
    // Delete archive directly from archives table
    await db.execute('DELETE FROM archives WHERE id = ?', [id]);
    
    res.status(200).json({ 
      success: true,
      message: 'Archive deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ message: 'Server error while deleting archive' });
  }
};