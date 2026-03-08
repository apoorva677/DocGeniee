const documentExportService = require('../services/documentExportService');

/**
 * Document Export Controller
 * Unifies all document downloads into a single service call.
 */
exports.exportDocument = async (req, res) => {
    try {
        const { html, title, format } = req.body;

        if (!html || !format) {
            return res.status(400).json({ success: false, error: 'HTML content and format are required' });
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
        console.error('[Export Controller Error]:', error);
        res.status(500).json({ success: false, error: 'Failed to export document: ' + error.message });
    }
};

