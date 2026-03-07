const pdfParse = require('pdf-parse');
const templateManagerService = require('./templateManagerService');

/**
 * Parses an uploaded PDF file Buffer to extract structural sections
 * and return a JSON structure pattern.
 * 
 * In a full production system, this could leverage AI. Here we use heuristics
 * looking for capitalized or numbered lines to act as headings over content.
 */
exports.analyzeTemplate = async (pdfBuffer, metadata) => {
    try {
        // `pdf-parse` module handles the buffer directly
        const data = await pdfParse(pdfBuffer);
        const textNodes = data.text.split('\n');
        
        const extractedSections = [];
        
        // Basic Heuristic: If a line is short (< 50 chars), doesn't end in punctuation, 
        // and is mostly Title Cased, assume it's a structural heading.
        for (let i = 0; i < textNodes.length; i++) {
            let line = textNodes[i].trim();
            if (!line) continue;
            
            // Heuristic flags
            const isShort = line.length > 2 && line.length < 50;
            const noEndingPunc = !['.', ',', ';'].includes(line.slice(-1));
            // Check if first character is upper case letter
            const firstChar = line.charAt(0);
            const isCapitalized = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
            
            // Treat as heading
            if (isShort && noEndingPunc && isCapitalized) {
                // If it looks like a heading, grab it as a section
                extractedSections.push(line);
            }
        }
        
        // If heuristic fails (e.g. document badly formatted), fallback to a basic standard structure
        let finalStructure = extractedSections.length > 2 
            ? extractedSections.map(s => ({ name: s.toLowerCase().replace(/[^a-z0-9]/g, '_'), label: s, type: "textarea" }))
            : [
                { name: "heading_1", label: "Heading 1", type: "textarea" },
                { name: "body_content", label: "Body Content", type: "textarea" },
                { name: "conclusion", label: "Conclusion", type: "textarea" }
            ];

        // Ensure title exists
        finalStructure.unshift({ name: "title", label: "Document Title", type: "text" });

        // Generate a new custom template ID based on filename
        const templateId = metadata.filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        const templateInfo = {
            id: templateId,
            name: metadata.templateName || "Custom Uploaded Template",
            description: metadata.description || `Extracted automatically from ${metadata.filename}`,
            filename: metadata.filename
        };
        
        // Store it to the master JSON configurations
        templateManagerService.saveExtractedTemplate(metadata.category, metadata.documentType, templateInfo, finalStructure);
        
        return {
            success: true,
            templateId,
            structureLength: finalStructure.length
        };
        
    } catch (err) {
        console.error('[TemplateAnalyzer] Analysis failed', err);
        throw new Error('Failed to analyze the template PDF: ' + err.message);
    }
};
