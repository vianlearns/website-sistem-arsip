const express = require('express');
const router = express.Router();
const staticFieldController = require('../controllers/staticField.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Public GET routes; admin operations require authentication

// Categories Routes
router.get('/categories', staticFieldController.getCategories);
router.post('/categories', verifyToken, verifyAdmin, staticFieldController.createCategory);
router.put('/categories/:id', verifyToken, verifyAdmin, staticFieldController.updateCategory);
router.delete('/categories/:id', verifyToken, verifyAdmin, staticFieldController.deleteCategory);

// Subcategories Routes
router.get('/subcategories', staticFieldController.getSubcategories);
router.get('/subcategories/by-category/:categoryId', staticFieldController.getSubcategoriesByCategory);
router.post('/subcategories', verifyToken, verifyAdmin, staticFieldController.createSubcategory);
router.put('/subcategories/:id', verifyToken, verifyAdmin, staticFieldController.updateSubcategory);
router.delete('/subcategories/:id', verifyToken, verifyAdmin, staticFieldController.deleteSubcategory);

// Locations Routes
router.get('/locations', staticFieldController.getLocations);
router.get('/locations/by-subcategory/:subcategoryId', staticFieldController.getLocationsBySubcategory);
router.post('/locations', verifyToken, verifyAdmin, staticFieldController.createLocation);
router.put('/locations/:id', verifyToken, verifyAdmin, staticFieldController.updateLocation);
router.delete('/locations/:id', verifyToken, verifyAdmin, staticFieldController.deleteLocation);

// Cabinets Routes
router.get('/cabinets', staticFieldController.getCabinets);
router.get('/cabinets/by-location/:locationId', staticFieldController.getCabinetsByLocation);
router.post('/cabinets', verifyToken, verifyAdmin, staticFieldController.createCabinet);
router.put('/cabinets/:id', verifyToken, verifyAdmin, staticFieldController.updateCabinet);
router.delete('/cabinets/:id', verifyToken, verifyAdmin, staticFieldController.deleteCabinet);

// Shelves Routes
router.get('/shelves', staticFieldController.getShelves);
router.get('/shelves/by-cabinet/:cabinetId', staticFieldController.getShelvesByCabinet);
router.post('/shelves', verifyToken, verifyAdmin, staticFieldController.createShelf);
router.put('/shelves/:id', verifyToken, verifyAdmin, staticFieldController.updateShelf);
router.delete('/shelves/:id', verifyToken, verifyAdmin, staticFieldController.deleteShelf);

// Positions Routes
router.get('/positions', staticFieldController.getPositions);
router.get('/positions/by-shelf/:shelfId', staticFieldController.getPositionsByShelf);
router.post('/positions', verifyToken, verifyAdmin, staticFieldController.createPosition);
router.put('/positions/:id', verifyToken, verifyAdmin, staticFieldController.updatePosition);
router.delete('/positions/:id', verifyToken, verifyAdmin, staticFieldController.deletePosition);

module.exports = router;