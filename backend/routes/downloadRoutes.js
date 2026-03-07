const express = require('express');
const router = express.Router();
const documentDownloadController = require('../controllers/documentDownloadController');

// POST /api/document/download
router.post('/download', documentDownloadController.downloadDocument);

module.exports = router;
