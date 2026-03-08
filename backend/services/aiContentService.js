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
                    content: 'You are DOC GENIE, an expert AI document generation platform. Your task is to output high-quality, perfectly formatted content based on user instructions. Use ONLY clean HTML formatting (<h2>, <p>, <ul>, <li>, <strong>). CRITICAL: Do NOT use any custom bullet symbols like "->", "*", or "-" inside the text or list items. Stick strictly to valid HTML tags for structure.'
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
        return chatCompletion.choices[0].message.content;

    } catch (error) {
        console.error('[AI Service Error]:', error);
        throw new Error('Failed to generate AI content via Groq: ' + error.message);
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
                    2. TAGGING: Wrap segments in the following tags:
                       - [TITLE]: Main document title
                       - [ADDRESS]: Contact info, sender/recipient addresses
                       - [DATE]: Date lines
                       - [SECTION]: Major section headings
                       - [SUBSECTION]: Minor headings
                       - [BODY]: Standard paragraphs
                       - [LIST_ITEM]: Bullet points or numbered items
                       - [CLOSING]: Sign-offs and signatures
                       - [ABSTRACT]: For academic papers or executive summaries
                    3. CONTENT PRESERVATION: Do NOT summarize. Keep all original information.
                    4. TYPE AWARENESS: You are processing a ${detectedType}. Tag accordingly.
                    
                    Output ONLY the tagged text with NO preamble.`
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
