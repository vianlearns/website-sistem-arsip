const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get all archives with pagination, search, and filtering
exports.getAllArchives = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', category_id = '', subcategory_id = '', position_id = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, c.name as category_name, sc.name as subcategory_name, sc.id as subcategory_id, p.name as position_name 
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id 
      LEFT JOIN subcategories sc ON a.subcategory_id = sc.id 
      LEFT JOIN positions p ON a.position_id = p.id 
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add search condition if provided
    if (search) {
      query += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Add category filter if provided (support both category and category_id parameters)
    if (category_id) {
      query += ` AND a.category_id = ?`;
      queryParams.push(category_id);
    } else if (category) {
      query += ` AND c.id = ?`;
      queryParams.push(category);
    }
    
    // Add subcategory filter if provided
    if (subcategory_id) {
      query += ` AND a.subcategory_id = ?`;
      queryParams.push(subcategory_id);
    }
    
    // Add position filter if provided
    if (position_id) {
      query += ` AND a.position_id = ?`;
      queryParams.push(position_id);
    }

    // Add order by and pagination
    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute query
    const [archives] = await db.execute(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id 
      LEFT JOIN subcategories sc ON a.subcategory_id = sc.id 
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    // Add category filter if provided (support both category and category_id parameters)
    if (category_id) {
      countQuery += ` AND a.category_id = ?`;
      countParams.push(category_id);
    } else if (category) {
      countQuery += ` AND c.id = ?`;
      countParams.push(category);
    }
    
    // Add subcategory filter if provided
    if (subcategory_id) {
      countQuery += ` AND a.subcategory_id = ?`;
      countParams.push(subcategory_id);
    }

    // Add position filter if provided
    if (position_id) {
      countQuery += ` AND a.position_id = ?`;
      countParams.push(position_id);
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
      SELECT a.*, c.name as category_name, sc.name as subcategory_name, sc.id as subcategory_id, p.name as position_name 
      FROM archives a 
      LEFT JOIN categories c ON a.category_id = c.id 
      LEFT JOIN subcategories sc ON a.subcategory_id = sc.id 
      LEFT JOIN positions p ON a.position_id = p.id 
      WHERE a.id = ?
    `, [id]);
    
    if (archives.length === 0) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    
    const archive = archives[0];
    

    
    res.status(200).json(archive);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ message: 'Server error while fetching archive' });
  }
};

// Create new archive
exports.createArchive = async (req, res) => {
  try {
    // Only admin can create archives
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const { title, description, category_id, category_name, subcategory_id, subcategory_name, position_id, date, location } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Handle category - use existing ID or create new category
    let finalCategoryId = category_id ? parseInt(category_id) : null;
    
    if (!finalCategoryId && category_name) {
      // Check if category exists
      const [existingCategories] = await db.execute('SELECT id FROM categories WHERE name = ?', [category_name]);
      
      if (existingCategories.length > 0) {
        finalCategoryId = existingCategories[0].id;
      } else {
        // Create new category
        const [newCategory] = await db.execute('INSERT INTO categories (name) VALUES (?)', [category_name]);
        finalCategoryId = newCategory.insertId;
      }
    }
    
    // Set image path if file was uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    // Handle subcategory if provided
    let finalSubcategoryId = subcategory_id ? parseInt(subcategory_id) : null;
    
    if (!finalSubcategoryId && subcategory_name && finalCategoryId) {
      // Check if subcategory exists
      const [existingSubcategories] = await db.execute('SELECT id FROM subcategories WHERE name = ? AND category_id = ?', [subcategory_name, finalCategoryId]);
      
      if (existingSubcategories.length > 0) {
        finalSubcategoryId = existingSubcategories[0].id;
      } else if (subcategory_name) {
        // Create new subcategory
        const [newSubcategory] = await db.execute('INSERT INTO subcategories (name, category_id) VALUES (?, ?)', [subcategory_name, finalCategoryId]);
        finalSubcategoryId = newSubcategory.insertId;
      }
    }
    
    // Handle position if provided
    let finalPositionId = null;
    if (position_id) {
      const [positions] = await db.execute('SELECT id, subcategory_id FROM positions WHERE id = ?', [parseInt(position_id)]);
      if (positions.length > 0) {
        // Optional: ensure position belongs to selected subcategory
        if (!finalSubcategoryId || positions[0].subcategory_id === finalSubcategoryId) {
          finalPositionId = positions[0].id;
        }
      }
    }

    // Insert archive
    const [result] = await db.execute(
      'INSERT INTO archives (title, description, category_id, subcategory_id, position_id, date, location, image, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, finalCategoryId, finalSubcategoryId, finalPositionId, date, location, imagePath, req.userId]
    );
    
    const archiveId = result.insertId;
    

    
    res.status(201).json({ 
      message: 'Archive created successfully', 
      id: archiveId 
    });
  } catch (error) {
    console.error('Error creating archive:', error);
    res.status(500).json({ message: 'Server error while creating archive' });
  }
};

// Update archive
exports.updateArchive = async (req, res) => {
  try {
    // Only admin can update archives
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const { id } = req.params;
    const { title, description, category_id, category_name, subcategory_id, subcategory_name, position_id, date, location } = req.body;
    
    // Check if archive exists
    const [archives] = await db.execute('SELECT * FROM archives WHERE id = ?', [id]);
    
    if (archives.length === 0) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    
    const archive = archives[0];
    
    // Handle category - use existing ID or create new category
    let finalCategoryId = category_id ? parseInt(category_id) : archive.category_id;
    
    if (!finalCategoryId && category_name) {
      // Check if category exists
      const [existingCategories] = await db.execute('SELECT id FROM categories WHERE name = ?', [category_name]);
      
      if (existingCategories.length > 0) {
        finalCategoryId = existingCategories[0].id;
      } else {
        // Create new category
        const [newCategory] = await db.execute('INSERT INTO categories (name) VALUES (?)', [category_name]);
        finalCategoryId = newCategory.insertId;
      }
    }
    
    // Set image path if file was uploaded
    let imagePath = archive.image;
    if (req.file) {
      // Delete old image if exists
      if (archive.image) {
        const oldImagePath = path.join(__dirname, '..', archive.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    // Handle subcategory if provided
    let finalSubcategoryId = subcategory_id ? parseInt(subcategory_id) : archive.subcategory_id;
    
    if (!finalSubcategoryId && subcategory_name && finalCategoryId) {
      // Check if subcategory exists
      const [existingSubcategories] = await db.execute('SELECT id FROM subcategories WHERE name = ? AND category_id = ?', [subcategory_name, finalCategoryId]);
      
      if (existingSubcategories.length > 0) {
        finalSubcategoryId = existingSubcategories[0].id;
      } else if (subcategory_name) {
        // Create new subcategory
        const [newSubcategory] = await db.execute('INSERT INTO subcategories (name, category_id) VALUES (?, ?)', [subcategory_name, finalCategoryId]);
        finalSubcategoryId = newSubcategory.insertId;
      }
    }
    
    // Handle position if provided
    let finalPositionId = archive.position_id;
    if (position_id !== undefined) {
      if (position_id) {
        const [positions] = await db.execute('SELECT id, subcategory_id FROM positions WHERE id = ?', [parseInt(position_id)]);
        if (positions.length > 0) {
          if (!finalSubcategoryId || positions[0].subcategory_id === finalSubcategoryId) {
            finalPositionId = positions[0].id;
          }
        }
      } else {
        finalPositionId = null;
      }
    }

    // Update archive
    await db.execute(
      'UPDATE archives SET title = ?, description = ?, category_id = ?, subcategory_id = ?, position_id = ?, date = ?, location = ?, image = ? WHERE id = ?',
      [title, description, finalCategoryId, finalSubcategoryId, finalPositionId, date, location, imagePath, id]
    );
    

    
    res.status(200).json({ message: 'Archive updated successfully' });
  } catch (error) {
    console.error('Error updating archive:', error);
    res.status(500).json({ message: 'Server error while updating archive' });
  }
};

// Delete archive
exports.deleteArchive = async (req, res) => {
  try {
    // Only admin can delete archives
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    const { id } = req.params;
    
    // Check if archive exists
    const [archives] = await db.execute('SELECT * FROM archives WHERE id = ?', [id]);
    
    if (archives.length === 0) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    
    const archive = archives[0];
    
    // Delete image if exists
    if (archive.image) {
      const imagePath = path.join(__dirname, '..', archive.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete archive (archive_tags will be deleted automatically due to CASCADE constraint)
    await db.execute('DELETE FROM archives WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Archive deleted successfully' });
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ message: 'Server error while deleting archive' });
  }
};