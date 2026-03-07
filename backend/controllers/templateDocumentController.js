const multer = require('multer');
const templateParserService = require('../services/templateParserService');
const templateDocumentGeneratorService = require('../services/templateDocumentGeneratorService');
const documentExportService = require('../services/documentExportService');
const { supabaseAdmin } = require('../config/supabase');

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
            const { userId, templateName, category, docType } = req.body;

            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file uploaded.' });
            }

            console.log('[Template Controller] Parsing file:', req.file.originalname, req.file.mimetype);

            const structure = await templateParserService.parseTemplate(
                req.file.buffer,
                req.file.mimetype
            );

            // SAVE to Supabase custom_templates if userId provided
            if (userId && supabaseAdmin) {
                const { data, error: dbError } = await supabaseAdmin
                    .from('custom_templates')
                    .insert([{
                        user_id: userId,
                        name: templateName || req.file.originalname.split('.')[0],
                        category: category || 'General',
                        doc_type: docType || 'Document',
                        structure: structure
                    }])
                    .select();
                
                if (dbError) console.error('[DB Error]: Failed to save template:', dbError);
                else console.log('[DB Success]: Custom template saved:', data[0].id);
            }

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
        const { templateStructure, userDetails, userId, title, category, docType } = req.body;

        if (!templateStructure || !templateStructure.sections || templateStructure.sections.length === 0) {
            return res.status(400).json({ success: false, error: 'Template structure with sections is required.' });
        }

        const result = await templateDocumentGeneratorService.generateFromTemplate(
            templateStructure,
            userDetails || {}
        );

        // SAVE to Supabase history if userId provided
        if (userId && supabaseAdmin) {
            const { error: dbError } = await supabaseAdmin
                .from('generated_documents')
                .insert([{
                    user_id: userId,
                    title: title || 'Generated from Template',
                    category: category || 'Template Generation',
                    doc_type: docType || 'Custom Document',
                    content_raw: JSON.stringify(userDetails),
                    content_formatted: result
                }]);
            
            if (dbError) console.error('[DB Error]: Failed to save generated document:', dbError);
        }

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
