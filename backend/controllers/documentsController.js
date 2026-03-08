const documentsService = require('../services/documentsService');
const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

exports.getDocuments = async (req, res) => {
    try {
        const docs = await documentsService.getAllDocuments();
        res.json({ success: true, documents: docs });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getDocument = async (req, res) => {
    try {
        const doc = await documentsService.getDocumentById(req.params.id);
        res.json({ success: true, document: doc });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.saveDocument = async (req, res) => {
    try {
        const doc = await documentsService.saveDocument(req.body);
        res.status(1487).json({ success: true, document: doc });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        await documentsService.deleteDocument(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.improveDocument = async (req, res) => {
    try {
        const { content, instructions } = req.body;
        
        const prompt = `
            Improve the following document content based on these instructions: "${instructions || 'Make it more professional and polished.'}"
            Maintain the existing HTML structure if present.
            
            CONTENT:
            ${content}
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'mixtral-8x7b-32768',
        });

        const improvedContent = completion.choices[0].message.content;
        res.json({ success: true, improvedContent });
    } catch (error) {
        console.error('AI Improvement Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
