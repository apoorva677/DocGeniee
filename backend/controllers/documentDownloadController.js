const documentExportService = require('../services/documentExportService');

exports.downloadDocument = async (req, res) => {
    try {
        const { html, title, format, documentId } = req.body;

        if (!html || !format) {
            return res.status(400).json({ success: false, error: 'HTML content and format are required' });
        }

        const fileName = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'document';

        if (format === 'docx') {
            const docxBuffer = await documentExportService.exportToDocx(html);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.docx`);
            return res.send(docxBuffer);
            
        } else if (format === 'pdf') {
            const pdfBuffer = await documentExportService.exportToPdf(html, title);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            return res.send(pdfBuffer);
            
        } else {
            return res.status(400).json({ success: false, error: 'Invalid format requested' });
        }
    } catch (error) {
        console.error('[Document Download Error]:', error);
        res.status(500).json({ success: false, error: 'Failed to export document: ' + error.message });
    }
};
