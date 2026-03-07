const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');

router.post('/generate', professionalController.generateProfessionalDocument);

module.exports = router;
