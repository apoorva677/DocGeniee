const aiContentService = require('../services/aiContentService');
const { supabaseAdmin } = require('../config/supabase');

exports.generateContent = async (req, res) => {
    try {
        const { title, topic, description, contentType, tone, length, userId } = req.body;

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

        // SAVE to Supabase history if userId provided (Both tables for backward compatibility and the new requirement)
        if (userId && supabaseAdmin) {
            // New 'documents' table record
            await supabaseAdmin
                .from('documents')
                .insert([{
                    user_id: userId,
                    title: title,
                    document_type: contentType,
                    source: 'AI Generator',
                    content: generatedText
                }]);

            // Original 'generated_documents' table (Keeping it for existing UI if needed)
            const { error: dbError } = await supabaseAdmin
                .from('generated_documents')
                .insert([{
                    user_id: userId,
                    title: title,
                    category: 'AI Content',
                    doc_type: contentType,
                    content_raw: description,
                    content_formatted: generatedText
                }]);
            
            if (dbError) console.error('[DB Error]: Failed to save AI generated content:', dbError);
        }

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
