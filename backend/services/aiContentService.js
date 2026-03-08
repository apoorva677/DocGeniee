const aiPromptBuilder = require('../utils/aiPromptBuilder');
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * AI Content Generation Service
 */
exports.generate = async (params) => {
    // 1. Build the prompt dynamically
    const prompt = aiPromptBuilder.buildPrompt(params);

    console.log('[AI Service] Generating content for prompt:', prompt);

    // Check if API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith('your_')) {
        throw new Error('Groq API key is missing or invalid in the .env file. Please configure the GROQ_API_KEY.');
    }

    try {
        // 2. Call the Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are DOC GENIE, an elite AI document architect. Your goal is to produce world-class documents with zero redundancy.
                    
                    STRICT RULES:
                    1. NO REPETITION: Never repeat a sentence or idea. Ever. 
                    2. PROFESSIONALISM: Use sophisticated, clear, and formal language.
                    3. STRUCTURE: Use ONLY valid HTML (<h2>, <p>, <ul>, <li>, <strong>). 
                    4. CLEANLINESS: No preamble ("Certainly!", "I have generated..."), just the document.
                    5. NO SYMBOLS: Never use markdown symbols (->, *, -) for lists; use the <ul> and <li> tags.
                    6. SUMMARIZATION: Conclusions must summarize, not repeat.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: params.length === 'Short' ? 300 : params.length === 'Medium' ? 800 : 1500
        });

        // 3. Return the generated text
        const content = chatCompletion.choices[0].message.content;
        
        // 4. Perform an extra validation pass to ensure quality (optional for performance, but user requested it)
        return await this.validateAndCleanContent(content);

    } catch (error) {
        console.error('[AI Service Error]:', error);
        throw new Error('Failed to generate AI content via Groq: ' + error.message);
    }
};

/**
 * AI Quality Control Service
 * Checks for repeated sentences, redundant paragraphs, and filler.
 */
exports.validateAndCleanContent = async (text) => {
    if (!text || text.length < 100) return text;

    console.log('[AI Service] Performing Quality Control pass...');

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a professional editor. Your task is to REMOVE REPETITION and IMPROVE QUALITY.
                    
                    INSTRUCTIONS:
                    1. Read the provided HTML document.
                    2. Identify and REMOVE any repeated sentences or identical points across sections.
                    3. Remove unnecessary filler content or "fluff".
                    4. Ensure logical flow between paragraphs.
                    5. DO NOT summarize or shorten the document substantially; just cleanup redundancies.
                    6. Return ONLY the cleaned HTML with no explanation.`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 5000
        });

        return chatCompletion.choices[0].message.content.trim();
    } catch (error) {
        console.error('[AI Quality Control Error]:', error);
        return text; // Fallback to raw text if QC fails
    }
};

/**
 * AI Content Refinement & Structural Tagging Service
 * Performs spell-check, grammar correction, and semantic tagging for the formatter
 */
exports.refineContent = async (text, detectedType = 'General Document') => {
    if (!text) return text;
    
    console.log(`[AI Service] Structuring and refining content for: ${detectedType}...`);

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith('your_')) {
        console.warn('[AI Service] API key missing, skipping structural refinement');
        return text;
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a professional document architect. Your task is to refine the provided text and add STRUCTURAL TAGS so a formatting engine can render it perfectly.
                    
                    RULES:
                    1. SPELLING/GRAMMAR: Fix all errors.
                    3. TAGGING: Wrap segments in the following tags:
                       - [TITLE]content[/TITLE]: Main document title
                       - [ADDRESS]content[/ADDRESS]: Contact info, sender/recipient addresses
                       - [DATE]content[/DATE]: Date lines
                       - [SECTION]content[/SECTION]: Major section headings
                       - [SUBSECTION]content[/SUBSECTION]: Minor headings
                       - [BODY]content[/BODY]: Standard paragraphs
                       - [LIST_ITEM]content[/LIST_ITEM]: Bullet points or numbered items
                       - [CLOSING]content[/CLOSING]: Sign-offs and signatures
                       - [ABSTRACT]content[/ABSTRACT]: For academic papers or executive summaries
                    4. CONTENT PRESERVATION: Do NOT summarize. Keep all original information.
                    5. TYPE AWARENESS: You are processing a ${detectedType}. Tag accordingly.
                    
                    Output ONLY the tagged text with NO preamble. Do NOT use markdown. Do NOT use any tags other than those listed above. Use EXACTLY the [TAG]...[/TAG] format.`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 5000
        });

        return chatCompletion.choices[0].message.content.trim();

    } catch (error) {
        console.error('[AI Refinement/Tagging Error]:', error);
        return text;
    }
};

/**
 * AI Document Type Detection Service
 * Analyzes text and instructions to determine the document type
 */
exports.detectDocumentType = async (text, instructions = '') => {
    if (!text) return 'General Document';
    
    console.log('[AI Service] Detecting document type...');

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith('your_')) {
        console.warn('[AI Service] API key missing, defaulting to General Document');
        return 'General Document';
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert document classifier. 
                    Analyze the provided document text and any user instructions to determine its type.
                    
                    The allowed types are:
                    - Letter
                    - Report
                    - Academic Paper
                    - Business Proposal
                    - Contract
                    - Agreement
                    - Legal Document
                    - Service Agreement
                    - Book
                    - Novel
                    - Resume
                    - General Document
                    
                    Return ONLY the type name from the list above. 
                    If instructions specify a type (e.g. "Format as a letter"), prioritize the instructions.
                    If unsure, return 'General Document'.`
                },
                {
                    role: 'user',
                    content: `Instructions: ${instructions}\n\nDocument Text (Snippet): ${text.substring(0, 3000)}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 20
        });

        const detected = chatCompletion.choices[0].message.content.trim();
        console.log(`[AI Service] Detected Type: ${detected}`);
        
        // Validation with fallback
        const validTypes = ['Letter', 'Report', 'Academic Paper', 'Business Proposal', 'Contract', 'Agreement', 'Legal Document', 'Service Agreement', 'Book', 'Novel', 'Resume', 'General Document'];
        const finalType = validTypes.includes(detected) ? detected : 'General Document';
        
        return finalType;

    } catch (error) {
        console.error('[AI Detection Error]:', error);
        return 'General Document';
    }
};
