const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

router.post('/generate', academicController.generateAcademicDocument);

module.exports = router;
