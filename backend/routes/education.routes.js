const express = require('express');
const router = express.Router();

const educationController = require('../controllers/education.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Levels
router.get('/levels', educationController.getLevels);
router.post('/levels', verifyToken, verifyAdmin, educationController.createLevel);
router.put('/levels/:id', verifyToken, verifyAdmin, educationController.updateLevel);
router.delete('/levels/:id', verifyToken, verifyAdmin, educationController.deleteLevel);

// Faculties
router.get('/faculties', educationController.getFaculties);
router.post('/faculties', verifyToken, verifyAdmin, educationController.createFaculty);
router.put('/faculties/:id', verifyToken, verifyAdmin, educationController.updateFaculty);
router.delete('/faculties/:id', verifyToken, verifyAdmin, educationController.deleteFaculty);

// Programs
router.get('/programs', educationController.getPrograms);
router.post('/programs', verifyToken, verifyAdmin, educationController.createProgram);
router.put('/programs/:id', verifyToken, verifyAdmin, educationController.updateProgram);
router.delete('/programs/:id', verifyToken, verifyAdmin, educationController.deleteProgram);

module.exports = router;