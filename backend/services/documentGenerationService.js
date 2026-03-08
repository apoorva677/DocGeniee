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
Generate a professional, well-structured ${documentType} with the exact following sections clearly defined using <h2> tags:

- ${structureString}

Each section must contain UNIQUE content. Avoid repeating the same information or phrases across multiple sections.

Section-Specific Guidance:
- Introduction: Briefly explain the purpose and context of the ${documentType}.
- Analysis/Main Content: Provide detailed insights, facts, and professional interpretation based on the provided info.
- Conclusion/Key Insights: Summarize key points in a concise manner without repeating entire sentences from previous sections.

Document Title: ${docTitle}

Specific User Information to incorporate:
${userInstructions}

Technical Formatting rules:
1. Provide ONLY clean HTML inside a <div>.
2. Use <h1> for the title: <h1>${docTitle}</h1>.
3. Use <h2> for major sections matching the list above EXACTLY.
4. Use <p> for body text and <ul>/<li> for lists.
5. NO markdown, NO preamble, NO conversational filler.
6. Maintain a highly professional and formal tone appropriate for a ${category} document.
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
