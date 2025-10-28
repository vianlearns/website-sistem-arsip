const db = require('../config/database');

// Normalize date string to 'YYYY-MM-DD' without timezone effects
// Accepts: 'DD-MM-YYYY', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ss.sssZ'
function normalizeDateString(input) {
  if (!input) return null;
  const s = String(input).trim();
  // If ISO with time, take first 10 chars
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return s.slice(0, 10);
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }
  // If DD-MM-YYYY → convert
  const dm = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dm) {
    const [, dd, mm, yyyy] = dm;
    return `${yyyy}-${mm}-${dd}`;
  }
  return null; // invalid format
}

// Get all letters with pagination, search, filtering, and optional sorting
exports.getAllLetters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sender = '',
      recipient = '',
      date = '',
      start_date = '',
      end_date = '',
      status = '',
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.id,
        l.name,
        DATE_FORMAT(l.date, '%Y-%m-%d') AS date,
        l.sender,
        l.recipient,
        l.subject,
        l.letter_type,
        l.current_status,
        l.file_path,
        l.created_by,
        l.created_at,
        l.updated_at
      FROM letters l
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (l.name LIKE ? OR l.subject LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sender) {
      query += ` AND l.sender LIKE ?`;
      params.push(`%${sender}%`);
    }

    if (recipient) {
      query += ` AND l.recipient LIKE ?`;
      params.push(`%${recipient}%`);
    }

    if (date) {
      query += ` AND l.date = ?`;
      params.push(date);
    } else if (start_date && end_date) {
      query += ` AND l.date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    if (status) {
      query += ` AND l.current_status = ?`;
      params.push(status);
    }

    // Allow sorting by a safe list of fields
    const allowedSort = new Set(['created_at', 'date', 'name', 'sender', 'recipient', 'current_status']);
    const finalSortBy = allowedSort.has(sort_by) ? sort_by : 'created_at';
    const finalSortOrder = String(sort_order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY l.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [letters] = await db.execute(query, params);

    // Count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM letters l
      WHERE 1=1
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (l.name LIKE ? OR l.subject LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (sender) {
      countQuery += ` AND l.sender LIKE ?`;
      countParams.push(`%${sender}%`);
    }
    if (recipient) {
      countQuery += ` AND l.recipient LIKE ?`;
      countParams.push(`%${recipient}%`);
    }
    if (date) {
      countQuery += ` AND l.date = ?`;
      countParams.push(date);
    } else if (start_date && end_date) {
      countQuery += ` AND l.date BETWEEN ? AND ?`;
      countParams.push(start_date, end_date);
    }
    if (status) {
      countQuery += ` AND l.current_status = ?`;
      countParams.push(status);
    }

    const [countRows] = await db.execute(countQuery, countParams);
    const total = countRows[0].total;

    res.status(200).json({
      success: true,
      data: letters,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching letters:', error);
    res.status(500).json({ message: 'Server error while fetching letters' });
  }
};

exports.getLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT 
        id,
        name,
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        sender,
        recipient,
        subject,
        letter_type,
        current_status,
        file_path,
        created_by,
        created_at,
        updated_at
      FROM letters WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Letter not found' });
    }
    // Also try to fetch optional details
    const [detailsRows] = await db.execute(
      'SELECT nim, nama, jenjang_pendidikan, fakultas, program_studi, DATE_FORMAT(tanggal_lulus, "%Y-%m-%d") AS tanggal_lulus, no_seri, nirl, telepon FROM letter_details WHERE letter_id = ? LIMIT 1',
      [id]
    );
    const base = rows[0];
    if (detailsRows.length > 0) {
      base.details = detailsRows[0];
    }
    res.status(200).json(base);
  } catch (error) {
    console.error('Error fetching letter by id:', error);
    res.status(500).json({ message: 'Server error while fetching letter' });
  }
};

// Update letter fields (admin only)
exports.updateLetter = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const { name, date, sender, recipient, subject, clearFile } = req.body;

    const [letters] = await db.execute('SELECT * FROM letters WHERE id = ?', [id]);
    if (letters.length === 0) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Normalize and validate date if provided; keep original if not provided
    let normalizedDate = null;
    if (date !== undefined) {
      normalizedDate = normalizeDateString(date);
      if (!normalizedDate) {
        return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD' });
      }
    }

    // Handle file operations
    let filePath = letters[0].file_path; // keep existing file path by default
    if (clearFile === 'true') {
      // User wants to clear the file
      filePath = null;
    } else if (req.file) {
      // User uploaded a new file
      filePath = req.file.filename;
    }

    await db.execute(
      'UPDATE letters SET name = ?, date = ?, sender = ?, recipient = ?, subject = ?, file_path = ? WHERE id = ?',
      [
        name || letters[0].name,
        normalizedDate !== null ? normalizedDate : letters[0].date,
        sender || letters[0].sender,
        recipient || letters[0].recipient,
        subject || letters[0].subject,
        filePath,
        id,
      ]
    );

    res.status(200).json({ success: true, message: 'Letter updated successfully' });
  } catch (error) {
    console.error('Error updating letter:', error);
    res.status(500).json({ message: 'Server error while updating letter' });
  }
};

// Delete letter (admin only)
exports.deleteLetter = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;

    const [letters] = await db.execute('SELECT * FROM letters WHERE id = ?', [id]);
    if (letters.length === 0) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Delete related history first to avoid constraints
    await db.execute('DELETE FROM letter_status_history WHERE letter_id = ?', [id]);
    await db.execute('DELETE FROM letters WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Letter deleted successfully' });
  } catch (error) {
    console.error('Error deleting letter:', error);
    res.status(500).json({ message: 'Server error while deleting letter' });
  }
};

exports.createLetter = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { name, date, sender, recipient, subject, letter_type } = req.body;
    if (!name || !date || !sender || !recipient || !subject || !letter_type) {
      return res.status(400).json({ message: 'All fields are required: name, date, sender, recipient, subject, letter_type' });
    }

    // Normalize and validate date on create
    const normalizedDate = normalizeDateString(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD' });
    }

    // Handle file upload
    const filePath = req.file ? req.file.filename : null;

    const [result] = await db.execute(
      'INSERT INTO letters (name, date, sender, recipient, subject, letter_type, file_path, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, normalizedDate, sender, recipient, subject, letter_type, filePath, req.userId || null]
    );

    const letterId = result.insertId;

    // Parse details from JSON string if present
    let details = {};
    if (req.body.details) {
      try {
        details = typeof req.body.details === 'string' ? JSON.parse(req.body.details) : req.body.details;
      } catch (err) {
        console.error('Failed to parse details JSON:', err);
      }
    }

    // Insert optional details for certain letter types
    if (String(letter_type).toLowerCase() !== 'biasa') {
      // Accept subset of fields for different types
      const {
        nim = null,
        nama = null,
        jenjang_pendidikan = null,
        fakultas = null,
        program_studi = null,
        tanggal_lulus = null,
        no_seri = null,
        nirl = null,
        telepon = null,
      } = details || {};

      let tanggalLulusNormalized = null;
      if (tanggal_lulus !== null && tanggal_lulus !== undefined && String(tanggal_lulus).trim() !== '') {
        tanggalLulusNormalized = normalizeDateString(String(tanggal_lulus));
        if (!tanggalLulusNormalized) {
          return res.status(400).json({ message: 'Invalid tanggal_lulus format. Use DD-MM-YYYY or YYYY-MM-DD' });
        }
      }

      await db.execute(
        'INSERT INTO letter_details (letter_id, nim, nama, jenjang_pendidikan, fakultas, program_studi, tanggal_lulus, no_seri, nirl, telepon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          letterId,
          nim,
          nama,
          jenjang_pendidikan,
          fakultas,
          program_studi,
          tanggalLulusNormalized,
          no_seri,
          nirl,
          telepon,
        ]
      );
    }

    res.status(201).json({ success: true, message: 'Letter created successfully', id: letterId });
  } catch (error) {
    console.error('Error creating letter:', error);
    res.status(500).json({ message: 'Server error while creating letter' });
  }
};

exports.updateLetterStatus = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;
    const { status, note = null } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Ensure letter exists
    const [letters] = await db.execute('SELECT * FROM letters WHERE id = ?', [id]);
    if (letters.length === 0) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Update current status
    await db.execute('UPDATE letters SET current_status = ? WHERE id = ?', [status, id]);

    // Insert history
    await db.execute(
      'INSERT INTO letter_status_history (letter_id, status, note) VALUES (?, ?, ?)',
      [id, status, note]
    );

    res.status(200).json({ success: true, message: 'Letter status updated and history recorded' });
  } catch (error) {
    console.error('Error updating letter status:', error);
    res.status(500).json({ message: 'Server error while updating letter status' });
  }
};

exports.getLetterHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT id, status, note, created_at FROM letter_status_history WHERE letter_id = ? ORDER BY created_at ASC',
      [id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching letter history:', error);
    res.status(500).json({ message: 'Server error while fetching history' });
  }
};

// Update a single history item (admin only)
exports.updateHistoryItem = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { id, historyId } = req.params;
    const { status, note = null } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const [histories] = await db.execute(
      'SELECT * FROM letter_status_history WHERE id = ? AND letter_id = ?',
      [historyId, id]
    );
    if (histories.length === 0) {
      return res.status(404).json({ message: 'History item not found' });
    }

    await db.execute(
      'UPDATE letter_status_history SET status = ?, note = ? WHERE id = ?',
      [status, note, historyId]
    );

    res.status(200).json({ success: true, message: 'History item updated' });
  } catch (error) {
    console.error('Error updating history item:', error);
    res.status(500).json({ message: 'Server error while updating history item' });
  }
};

// Delete a single history item (admin only)
exports.deleteHistoryItem = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { id, historyId } = req.params;

    const [histories] = await db.execute(
      'SELECT * FROM letter_status_history WHERE id = ? AND letter_id = ?',
      [historyId, id]
    );
    if (histories.length === 0) {
      return res.status(404).json({ message: 'History item not found' });
    }

    await db.execute('DELETE FROM letter_status_history WHERE id = ?', [historyId]);

    res.status(200).json({ success: true, message: 'History item deleted' });
  } catch (error) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ message: 'Server error while deleting history item' });
  }
};

exports.getRekap = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'start_date and end_date are required' });
    }

    let groupExpr = 'DATE(l.date)';
    if (group_by === 'week') {
      groupExpr = 'YEARWEEK(l.date, 1)';
    } else if (group_by === 'month') {
      groupExpr = 'DATE_FORMAT(l.date, "%Y-%m")';
    }

    const [rows] = await db.execute(
      `SELECT ${groupExpr} as period, COUNT(*) as total
       FROM letters l
       WHERE l.date BETWEEN ? AND ?
       GROUP BY period
       ORDER BY period ASC`,
      [start_date, end_date]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error generating rekap:', error);
    res.status(500).json({ message: 'Server error while generating rekap' });
  }
};