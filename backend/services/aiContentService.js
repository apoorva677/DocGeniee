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
