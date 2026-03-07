const multer = require('multer');
const templateParserService = require('../services/templateParserService');
const templateDocumentGeneratorService = require('../services/templateDocumentGeneratorService');
const documentExportService = require('../services/documentExportService');

// Multer memory storage — store uploaded file in memory buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are accepted.'));
        }
    }
});

/**
 * POST /api/template-doc/parse-template
 * Receives an uploaded PDF or DOCX and returns extracted structure.
 */
exports.parseTemplate = [
    upload.single('templateFile'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file uploaded.' });
            }

            console.log('[Template Controller] Parsing file:', req.file.originalname, req.file.mimetype);

            const structure = await templateParserService.parseTemplate(
                req.file.buffer,
                req.file.mimetype
            );

            return res.json({ success: true, structure });
        } catch (error) {
            console.error('[Template Controller Parse Error]:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
];

/**
 * POST /api/template-doc/generate
 * Receives extracted template structure + user details. Returns generated, formatted HTML.
 */
exports.generateDocument = async (req, res) => {
    try {
        const { templateStructure, userDetails } = req.body;

        if (!templateStructure || !templateStructure.sections || templateStructure.sections.length === 0) {
            return res.status(400).json({ success: false, error: 'Template structure with sections is required.' });
        }

        const result = await templateDocumentGeneratorService.generateFromTemplate(
            templateStructure,
            userDetails || {}
        );

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error('[Template Controller Generate Error]:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/template-doc/download
 * Receives HTML + format. Returns a PDF or DOCX file download.
 */
exports.downloadDocument = async (req, res) => {
    try {
        const { html, title, format } = req.body;

        if (!html || !format) {
            return res.status(400).json({ success: false, error: 'HTML content and format are required.' });
        }

        const fileName = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (format === 'pdf') {
            const pdfBuffer = await documentExportService.exportToPdf(html, title);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            return res.send(pdfBuffer);

        } else if (format === 'docx') {
            const docxBuffer = await documentExportService.exportToDocx(html);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.docx`);
            return res.send(docxBuffer);

        } else {
            return res.status(400).json({ success: false, error: 'Invalid format. Use pdf or docx.' });
        }
    } catch (error) {
        console.error('[Template Controller Download Error]:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
