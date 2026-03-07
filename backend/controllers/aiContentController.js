const aiContentService = require('../services/aiContentService');

exports.generateContent = async (req, res) => {
    try {
        const { title, topic, description, contentType, tone, length } = req.body;

        // Validation
        if (!title || !topic || !description || !contentType || !tone || !length) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields (title, topic, description, contentType, tone, length) are required.' 
            });
        }

        // Call AI Service
        const generatedText = await aiContentService.generate({
            title, topic, description, contentType, tone, length
        });

        // Return generated text
        res.status(200).json({
            success: true,
            generatedContent: generatedText
        });
        
    } catch (error) {
        console.error('Error generating AI content:', error);
        res.status(500).json({ 
            success: false, 
            error: 'An error occurred while generating content. ' + error.message
        });
    }
};
