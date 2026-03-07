const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Utility to extract text from various document formats
 */
exports.parseDocument = async (filePath, mimetype) => {
    console.log(`[Document Parser]: Extracting text from document`);
    
    try {
        let extractedText = '';

        if (mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const parser = new pdf.PDFParse({ data: dataBuffer });
            const result = await parser.getText();
            extractedText = result.text;
            await parser.destroy();
        } 
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 mimetype === 'application/msword') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } 
        else {
            throw new Error('Unsupported file format. Please upload PDF or DOC/DOCX.');
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('The document appears to be empty or could not be read.');
        }

        // Clean extracted text: Remove empty lines, normalize whitespace
        const cleanedText = extractedText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        console.log('[Document Parser]: Text extracted and cleaned successfully');
        return cleanedText;
    } catch (error) {
        console.error('[Document Parser Error]:', error);
        throw new Error('Failed to parse document: ' + error.message);
    }
};
