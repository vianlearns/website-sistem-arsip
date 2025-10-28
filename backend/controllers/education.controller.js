const db = require('../config/database');

// Levels (Jenjang Pendidikan)
exports.getLevels = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM education_levels ORDER BY name');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching education levels:', error);
    res.status(500).json({ message: 'Server error while fetching education levels' });
  }
};

exports.createLevel = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Level name is required' });
    }
    const [existing] = await db.execute('SELECT id FROM education_levels WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Level with this name already exists' });
    }
    const [result] = await db.execute('INSERT INTO education_levels (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Level created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating level:', error);
    res.status(500).json({ message: 'Server error while creating level' });
  }
};

exports.updateLevel = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Level name is required' });
    }
    const [levels] = await db.execute('SELECT * FROM education_levels WHERE id = ?', [id]);
    if (levels.length === 0) {
      return res.status(404).json({ message: 'Level not found' });
    }
    const [dup] = await db.execute('SELECT id FROM education_levels WHERE name = ? AND id != ?', [name, id]);
    if (dup.length > 0) {
      return res.status(400).json({ message: 'Level with this name already exists' });
    }
    await db.execute('UPDATE education_levels SET name = ? WHERE id = ?', [name, id]);
    res.status(200).json({ message: 'Level updated successfully' });
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({ message: 'Server error while updating level' });
  }
};

exports.deleteLevel = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const [levels] = await db.execute('SELECT * FROM education_levels WHERE id = ?', [id]);
    if (levels.length === 0) {
      return res.status(404).json({ message: 'Level not found' });
    }
    await db.execute('DELETE FROM education_levels WHERE id = ?', [id]);
    res.status(200).json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    res.status(500).json({ message: 'Server error while deleting level' });
  }
};

// Faculties (Fakultas)
exports.getFaculties = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM faculties ORDER BY name');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ message: 'Server error while fetching faculties' });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Faculty name is required' });
    }
    const [existing] = await db.execute('SELECT id FROM faculties WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Faculty with this name already exists' });
    }
    const [result] = await db.execute('INSERT INTO faculties (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Faculty created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ message: 'Server error while creating faculty' });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Faculty name is required' });
    }
    const [faculties] = await db.execute('SELECT * FROM faculties WHERE id = ?', [id]);
    if (faculties.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    const [dup] = await db.execute('SELECT id FROM faculties WHERE name = ? AND id != ?', [name, id]);
    if (dup.length > 0) {
      return res.status(400).json({ message: 'Faculty with this name already exists' });
    }
    await db.execute('UPDATE faculties SET name = ? WHERE id = ?', [name, id]);
    res.status(200).json({ message: 'Faculty updated successfully' });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Server error while updating faculty' });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const [faculties] = await db.execute('SELECT * FROM faculties WHERE id = ?', [id]);
    if (faculties.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    await db.execute('DELETE FROM faculties WHERE id = ?', [id]);
    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ message: 'Server error while deleting faculty' });
  }
};

// Programs (Program Studi)
exports.getPrograms = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM programs ORDER BY name');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Server error while fetching programs' });
  }
};

exports.createProgram = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { name, faculty_id, level_id } = req.body;
    if (!name || !faculty_id) {
      return res.status(400).json({ message: 'Name and faculty_id are required' });
    }
    // Validate foreign keys
    const [fac] = await db.execute('SELECT id FROM faculties WHERE id = ?', [faculty_id]);
    if (fac.length === 0) return res.status(404).json({ message: 'Faculty not found' });
    if (level_id) {
      const [lvl] = await db.execute('SELECT id FROM education_levels WHERE id = ?', [level_id]);
      if (lvl.length === 0) return res.status(404).json({ message: 'Education level not found' });
    }
    const [result] = await db.execute(
      'INSERT INTO programs (name, faculty_id, level_id) VALUES (?, ?, ?)',
      [name, faculty_id, level_id || null]
    );
    res.status(201).json({ message: 'Program created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Server error while creating program' });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const { name, faculty_id, level_id } = req.body;
    const [programs] = await db.execute('SELECT * FROM programs WHERE id = ?', [id]);
    if (programs.length === 0) return res.status(404).json({ message: 'Program not found' });
    if (faculty_id) {
      const [fac] = await db.execute('SELECT id FROM faculties WHERE id = ?', [faculty_id]);
      if (fac.length === 0) return res.status(404).json({ message: 'Faculty not found' });
    }
    if (level_id) {
      const [lvl] = await db.execute('SELECT id FROM education_levels WHERE id = ?', [level_id]);
      if (lvl.length === 0) return res.status(404).json({ message: 'Education level not found' });
    }
    await db.execute('UPDATE programs SET name = ?, faculty_id = ?, level_id = ? WHERE id = ?', [name || programs[0].name, faculty_id || programs[0].faculty_id, (level_id ?? programs[0].level_id), id]);
    res.status(200).json({ message: 'Program updated successfully' });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ message: 'Server error while updating program' });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const [programs] = await db.execute('SELECT * FROM programs WHERE id = ?', [id]);
    if (programs.length === 0) return res.status(404).json({ message: 'Program not found' });
    await db.execute('DELETE FROM programs WHERE id = ?', [id]);
    res.status(200).json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ message: 'Server error while deleting program' });
  }
};