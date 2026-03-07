const templateManagerService = require('./templateManagerService');
const aiContentService = require('./aiContentService');
const formattingEngine = require('./intelligentFormattingEngine');

/**
 * Orchestrates the full document generation process.
 */
exports.generateDocument = async ({ category, documentType, fieldData }) => {
    try {
        console.log(`[Document Gen Service] Starting generation for ${category} -> ${documentType}`);
        
        // Use custom template if provided by the frontend, else standard
        const templateRef = fieldData.templateRef || 'standard';
        
        // 1. Get the requested template structure dynamically
        const structureArray = templateManagerService.getTemplateStructure(category, documentType, templateRef);
        
        if (!structureArray) {
            throw new Error(`Failed to find structure for ${documentType} under ${category}`);
        }

        // 2. Build AI Prompt dynamically based on structure labels
        const structureString = structureArray.map(item => item.label || item).join('\n- ');
        
        // Convert fieldData into a readable string for instructions
        // Exclude templateRef so we don't accidentally prompt the AI with it as content
        let userInstructions = Object.entries(fieldData)
            .filter(([key]) => key !== 'templateRef')
            .map(([key, value]) => `- ${key}: ${value}`)
            .join('\n');
            
        // Fallback title logic
        const docTitle = fieldData.title || `${documentType} Document`;

        const prompt = `
Generate a structured ${documentType} with the exact following sections clearly defined using <h2> tags:

- ${structureString}

Document Title: ${docTitle}

Here is the specific information provided by the user to use in the document. You MUST incorporate this information appropriately into the corresponding sections:
${userInstructions}

Formatting rules:
- Provide ONLY the direct content text (HTML format) without introductory remarks like "Here is your document".
- Start directly with <h1>${docTitle}</h1>.
- Use <h2> for main sections EXACTLY matching the required sections above.
- Use <p> for paragraphs.
- Use <ul> / <li> for bullet points where appropriate.
- Do NOT use markdown. Reply with pure HTML structure inside a <div>.
- Ensure the document is highly professional, formal, and well-structured, matching the tone expected for a ${category} document.
        `.trim();

        // 3. Send prompt to AI Content Generator
        const aiResponse = await aiContentService.generate({
            title: docTitle,
            topic: documentType,
            description: prompt,
            contentType: 'Document',
            tone: 'Professional and Formal',
            length: 'Long'
        });

        // 4. Send generated content to Intelligent Formatting Engine
        const formattedDoc = formattingEngine.formatDocument(aiResponse, documentType, category);

        // 5. Return formatted document
        return {
            title: docTitle,
            documentType: documentType,
            category: category,
            rawHtml: aiResponse,
            formattedHtml: formattedDoc
        };

    } catch (error) {
        console.error('[Document Gen Service Error]', error);
        throw error;
    }
};
