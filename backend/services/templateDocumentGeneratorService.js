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
Generate a complete, professional document that EXACTLY follows the structure of the provided template.

REQUIRED SECTIONS (maintain this exact order):
${sectionsList}

Document Title: ${docTitle}

User Details to incorporate:
${userDetailsStr || '- No additional details provided. Generate appropriate content for each section based on the labels.'}

STRICT Quality Rules:
1. NO REPETITION: Do not repeat facts, sentences, or ideas across different sections.
2. UNIQUE VALUE: Each section must contain its own unique information.
3. SUMMARIZATION: The conclusion must summarize the entire document without duplicating earlier paragraphs.
4. SECTION GUIDANCE:
    - Introduction/Overview: Contextualize the document.
    - Main Details: Focus on the specific user data.
    - Conclusion: Wrap up professionally with unique wording.

Technical Rules:
- Output ONLY clean HTML — no markdown, no conversational filler.
- Use <h1> for the title.
- Use <h2> for EACH section header matching the list above EXACTLY.
- Use <p> and <ul>/<li> for structure.
- Content must be professional, formal, and submission-ready.
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
