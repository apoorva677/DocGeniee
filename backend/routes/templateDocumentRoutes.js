const express = require('express');
const router = express.Router();
const templateDocumentController = require('../controllers/templateDocumentController');

// POST /api/template-doc/parse-template  — Upload + analyze a PDF or DOCX
router.post('/parse-template', ...templateDocumentController.parseTemplate);

// POST /api/template-doc/generate  — Generate document from structure + user details
router.post('/generate', templateDocumentController.generateDocument);

// POST /api/template-doc/download  — Download the generated HTML as PDF or DOCX
router.post('/download', templateDocumentController.downloadDocument);

module.exports = router;
