const fs = require('fs');
const formattingService = require('../services/formattingService');
const documentParser = require('../utils/documentParser');
const aiContentService = require('../services/aiContentService');
const { supabaseAdmin } = require('../config/supabase');

/**
 * Helper: Convert a filename slug to a clean Title Case string
 * e.g. "sample-service-agreement" -> "Sample Service Agreement"
 */
function slugToTitle(slug) {
    return slug
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
}

/**
 * Intelligent Formatting Controller
 */
exports.formatContent = async (req, res) => {
    try {
        let { title, content, mode, formattingType, alignment, spacing, headingStyle, lineSpacing, bulletStyle, fontStyle, fontSize, boldHeadings, documentTheme } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required for formatting' });
        }

        // 1. AI Document Type Detection for manual content
        const detectedType = await aiContentService.detectDocumentType(content);
        console.log('[Formatting Controller]: AI detected manual type:', detectedType);

        // 2. AI Structural Refinement
        const refinedText = await aiContentService.refineContent(content, detectedType);

        console.log('[Formatting Controller]: Applying professional formatting rules');
        const formattedContent = await formattingService.format({
            title,
            content: refinedText,
            formattingType: detectedType, // Use AI detection result
            alignment,
            paraSpacing: spacing,
            fontSize,
            boldHeadings,
            lineSpacing,
            fontStyle,
            documentTheme
        });

        console.log('[Formatting Controller]: Formatting completed successfully');
        res.json({
            success: true,
            detectedType: detectedType,
            formattedContent: formattedContent
        });

    } catch (error) {
        console.error('[Formatting Controller Error]:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};

/**
 * Handle formatting for uploaded documents
 */
exports.formatUploadedDocument = async (req, res) => {
    const file = req.file;

    try {
        let { title, userId, mode, alignment, spacing, headingStyle, lineSpacing, bulletStyle, fontStyle, fontSize, boldHeadings, documentTheme, formattingInstructions } = req.body;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Document file is required' });
        }

        console.log('Document uploaded');

        // 1. Extract text from the doc
        const extractedText = await documentParser.parseDocument(file.path, file.mimetype);
        console.log('Text extracted successfully');

        // 2. AI Document Type Detection
        const detectedType = await aiContentService.detectDocumentType(extractedText, formattingInstructions);
        console.log('AI detected document type:', detectedType);

        // 3. AI Refinement & Structural Tagging
        const refinedText = await aiContentService.refineContent(extractedText, detectedType);

        // 4. Format the extracted text
        console.log('Formatting rules applied');
        const rawTitle = title || file.originalname.split('.')[0];
        const cleanTitle = slugToTitle(rawTitle);
        const formattedContent = await formattingService.format({
            title: cleanTitle,
            content: refinedText,
            mode: mode || 'auto',
            formattingType: detectedType, // AI Detected Type
            alignment,
            paraSpacing: spacing,
            headingStyle,
            lineSpacing,
            bulletStyle,
            fontStyle,
            fontSize,
            boldHeadings,
            formattingInstructions,
            documentTheme
        });



        console.log('Formatted document returned');

        res.json({
            success: true,
            detectedType: detectedType,
            formattedContent: formattedContent
        });

    } catch (error) {
        console.error('[Document Formatting Controller Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to process document: ' + error.message });
    } finally {
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) console.error(`[Formatting Controller]: Failed to delete temporary file ${file.path}:`, err);
            });
        }
    }
};
