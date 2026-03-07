const templateManagerService = require('../services/templateManagerService');
const templateAnalysisService = require('../services/templateAnalysisService');
const fs = require('fs');

/**
 * Handle listing available templates per document type
 * GET /api/templates/category/:category/type/:docType
 */
exports.getTemplates = (req, res) => {
    try {
        const { category, docType } = req.params;
        const decodeType = decodeURIComponent(docType);
        
        // Use manager service to parse available templates dynamically
        const templatesData = templateManagerService.getTemplatesByDocType(category, decodeType);
        
        // The service will format them as expected (Standard + any existing uploaded ones)
        res.json({ success: true, templates: templatesData });
    } catch (error) {
        console.error('Error in getTemplates:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch template structures.' });
    }
};

/**
 * Streaming actual PDF files for the iframe preview to block downloads natively
 * GET /api/templates/preview/:filename
 */
exports.previewTemplate = (req, res) => {
    try {
        const filename = req.params.filename;
        const pdfPath = templateManagerService.resolvePreviewPath(filename);
        
        if (!pdfPath) {
            return res.status(404).send('Template preview not found on the server.');
        }

        // Set security headers to prevent downloading as much as possible native in the browser
        res.setHeader('Content-Type', 'application/pdf');
        // 'inline' forces display in browser instead of attachment download
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
    } catch (error) {
        res.status(500).send('Error streaming preview.');
    }
};

/**
 * Handles multipart form data for uploading an example PDF
 * POST /api/templates/upload-example
 */
exports.uploadExample = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });
        }

        if (req.file.mimetype !== 'application/pdf') {
            // Cleanup invalid file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, error: 'Only PDF format is supported for templates.' });
        }

        const { category, documentType, templateName, description } = req.body;
        
        // Metadata required to identify structure rules mapping
        const metadata = {
            filename: req.file.filename,
            category,
            documentType,
            templateName,
            description
        };

        // File is physically buffered locally in 'templateStorage', pass the buffer object explicitly
        // This initiates analyzing the structure and registering the template IDs
        const pdfBuffer = fs.readFileSync(req.file.path);
        const result = await templateAnalysisService.analyzeTemplate(pdfBuffer, metadata);
        
        res.json({ 
            success: true, 
            message: 'Template analyzed and successfully mapped.',
            templateId: result.templateId 
        });

    } catch (error) {
        console.error('Error in uploadExample:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to analyze example template.' });
    }
};
