const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const structureExtractor = require('../utils/documentStructureExtractor');

/**
 * Template Parser Service
 * Accepts a Multer file buffer (PDF or DOCX) and returns extracted template structure.
 */

/**
 * @param {Buffer} fileBuffer - File content as Buffer
 * @param {string} mimeType - MIME type of the uploaded file
 * @returns {Promise<{ title: string, sections: string[] }>}
 */
exports.parseTemplate = async (fileBuffer, mimeType) => {
    let rawText = '';

    if (mimeType === 'application/pdf') {
        // Use pdf-parse for PDF files
        const pdfData = await pdfParse(fileBuffer);
        rawText = pdfData.text;

    } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
    ) {
        // Use mammoth for DOCX files — extract raw text
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        rawText = result.value;

    } else {
        throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.`);
    }

    if (!rawText || rawText.trim().length < 10) {
        throw new Error('Could not extract meaningful text from the uploaded file. The file may be empty or image-based.');
    }

    console.log('[Template Parser] Extracted text length:', rawText.length);

    // Extract structure from raw text
    const structure = structureExtractor.extractStructure(rawText);

    console.log('[Template Parser] Extracted structure:', structure);

    return structure;
};
