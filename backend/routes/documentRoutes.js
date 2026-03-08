const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Route to export document
router.post('/export', documentController.exportDocument);

// CRUD Routes for Documents History
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/', documentController.saveDocument);
router.delete('/:id', documentController.deleteDocument);

// AI Document Improver
router.post('/:id/improve', documentController.improveDocument);

module.exports = router;
