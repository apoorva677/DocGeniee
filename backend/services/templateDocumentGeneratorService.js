const aiContentService = require('./aiContentService');
const formattingEngine = require('./intelligentFormattingEngine');

/**
 * Template Document Generator Service
 * Generates a document that follows the structure of the uploaded template.
 */

/**
 * @param {{ title: string, sections: string[] }} templateStructure - Extracted from uploaded file
 * @param {{ title?: string, author?: string, organization?: string, purpose?: string, keyPoints?: string, additionalInstructions?: string }} userDetails
 * @returns {Promise<{ rawHtml: string, formattedHtml: string, title: string }>}
 */
exports.generateFromTemplate = async (templateStructure, userDetails) => {
    const docTitle = userDetails.title || templateStructure.title || 'Generated Document';

    // Build sections string from extracted template
    const sectionsList = templateStructure.sections
        .map((s, i) => `${i + 1}. ${s}`)
        .join('\n');

    // Build user details string
    const userDetailsStr = Object.entries(userDetails)
        .filter(([key, val]) => val && val.trim())
        .map(([key, val]) => {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            return `- ${label.charAt(0).toUpperCase() + label.slice(1)}: ${val}`;
        })
        .join('\n');

    const prompt = `
Generate a complete, professional document that EXACTLY follows the structure below.

REQUIRED SECTIONS (maintain this exact order):
${sectionsList}

Document Title: ${docTitle}

User-Provided Details to incorporate into the document:
${userDetailsStr || '- No additional details provided. Generate appropriate content for each section.'}

CRITICAL Formatting Rules:
- Output ONLY clean HTML — no markdown, no explanations.
- Start directly with <h1>${docTitle}</h1>.
- Use <h2> for EACH section header listed above, matching them exactly.
- Use <p> for paragraphs and <ul><li> for bullet lists where appropriate.
- Generate meaningful, professional, and complete content for each section.
- Incorporate the user's details into the relevant sections naturally.
- Any section not covered by user details must be filled with professionally generated AI content.
- The document must feel complete, coherent, and submission-ready.
    `.trim();

    console.log('[Template Doc Generator] Generating document with sections:', templateStructure.sections);

    // Call existing AI content service
    const aiRawHtml = await aiContentService.generate({
        title: docTitle,
        topic: 'Template-Based Document',
        description: prompt,
        contentType: 'Document',
        tone: 'Professional and Formal',
        length: 'Long'
    });

    // Pass through Intelligent Formatting Engine
    const formattedHtml = formattingEngine.formatDocument(aiRawHtml, docTitle, 'Template-Based');

    return {
        title: docTitle,
        rawHtml: aiRawHtml,
        formattedHtml
    };
};
