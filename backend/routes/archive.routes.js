const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archive.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes (accessible to all users)
router.get('/', archiveController.getAllArchives);
router.get('/:id', archiveController.getArchiveById);

// Admin-only routes (require authentication and admin role)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), archiveController.createArchive);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), archiveController.updateArchive);
router.delete('/:id', verifyToken, verifyAdmin, archiveController.deleteArchive);

module.exports = router;