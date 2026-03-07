const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legalController');

router.post('/generate', legalController.generateLegalDocument);

module.exports = router;
