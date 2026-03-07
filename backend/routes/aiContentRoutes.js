const express = require('express');
const router = express.Router();
const aiContentController = require('../controllers/aiContentController');

// POST /api/ai-content/generate
router.post('/generate', aiContentController.generateContent);

module.exports = router;
