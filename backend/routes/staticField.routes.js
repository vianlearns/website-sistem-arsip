const express = require('express');
const router = express.Router();
const staticFieldController = require('../controllers/staticField.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Categories Routes
router.get('/categories', staticFieldController.getCategories);
router.post('/categories', verifyAdmin, staticFieldController.createCategory);
router.put('/categories/:id', verifyAdmin, staticFieldController.updateCategory);
router.delete('/categories/:id', verifyAdmin, staticFieldController.deleteCategory);

// Subcategories Routes
router.get('/subcategories', staticFieldController.getSubcategories);
router.get('/subcategories/by-category/:categoryId', staticFieldController.getSubcategoriesByCategory);
router.post('/subcategories', verifyAdmin, staticFieldController.createSubcategory);
router.put('/subcategories/:id', verifyAdmin, staticFieldController.updateSubcategory);
router.delete('/subcategories/:id', verifyAdmin, staticFieldController.deleteSubcategory);

// Locations Routes
router.get('/locations', staticFieldController.getLocations);
router.get('/locations/by-subcategory/:subcategoryId', staticFieldController.getLocationsBySubcategory);
router.post('/locations', verifyAdmin, staticFieldController.createLocation);
router.put('/locations/:id', verifyAdmin, staticFieldController.updateLocation);
router.delete('/locations/:id', verifyAdmin, staticFieldController.deleteLocation);

// Cabinets Routes
router.get('/cabinets', staticFieldController.getCabinets);
router.get('/cabinets/by-location/:locationId', staticFieldController.getCabinetsByLocation);
router.post('/cabinets', verifyAdmin, staticFieldController.createCabinet);
router.put('/cabinets/:id', verifyAdmin, staticFieldController.updateCabinet);
router.delete('/cabinets/:id', verifyAdmin, staticFieldController.deleteCabinet);

// Shelves Routes
router.get('/shelves', staticFieldController.getShelves);
router.get('/shelves/by-cabinet/:cabinetId', staticFieldController.getShelvesByCabinet);
router.post('/shelves', verifyAdmin, staticFieldController.createShelf);
router.put('/shelves/:id', verifyAdmin, staticFieldController.updateShelf);
router.delete('/shelves/:id', verifyAdmin, staticFieldController.deleteShelf);

// Positions Routes
router.get('/positions', staticFieldController.getPositions);
router.get('/positions/by-shelf/:shelfId', staticFieldController.getPositionsByShelf);
router.post('/positions', verifyAdmin, staticFieldController.createPosition);
router.put('/positions/:id', verifyAdmin, staticFieldController.updatePosition);
router.delete('/positions/:id', verifyAdmin, staticFieldController.deletePosition);

module.exports = router;