const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letter.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public list & detail
router.get('/', letterController.getAllLetters);
router.get('/:id', letterController.getLetterById);
router.get('/:id/history', letterController.getLetterHistory);
router.get('/rekap/summary', letterController.getRekap);

// Admin operations with file upload support
router.post('/', verifyToken, verifyAdmin, upload.single('file'), letterController.createLetter);
router.put('/:id', verifyToken, verifyAdmin, upload.single('file'), letterController.updateLetter);
router.delete('/:id', verifyToken, verifyAdmin, letterController.deleteLetter);
router.put('/:id/status', verifyToken, verifyAdmin, letterController.updateLetterStatus);
router.put('/:id/history/:historyId', verifyToken, verifyAdmin, letterController.updateHistoryItem);
router.delete('/:id/history/:historyId', verifyToken, verifyAdmin, letterController.deleteHistoryItem);

module.exports = router;