const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController');

// GET /api/db/documents/:userId
router.get('/documents/:userId', dbController.getUserDocuments);

// GET /api/db/templates/:userId
router.get('/templates/:userId', dbController.getUserTemplates);

module.exports = router;
