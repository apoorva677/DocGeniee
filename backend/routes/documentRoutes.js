const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Route to export document
router.post('/export', documentController.exportDocument);

module.exports = router;
