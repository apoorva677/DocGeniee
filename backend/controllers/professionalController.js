const documentGenerationService = require('../services/documentGenerationService');
const { supabaseAdmin } = require('../config/supabase');

exports.generateProfessionalDocument = async (req, res) => {
    try {
        const { documentType, fieldData, userId } = req.body;

        if (!documentType || !fieldData) {
            return res.status(400).json({ 
                success: false, 
                error: 'documentType and fieldData are required.' 
            });
        }

        const result = await documentGenerationService.generateDocument({
            category: 'professional',
            documentType,
            fieldData
        });

        // Save to Supabase if userId is provided
        if (userId && supabaseAdmin) {
            try {
                // New 'documents' table
                await supabaseAdmin.from('documents').insert([{
                    user_id: userId,
                    title: fieldData.title || documentType,
                    document_type: documentType,
                    source: 'Professional Generator',
                    content: result.formattedHtml
                }]);

                // Original table
                await supabaseAdmin.from('generated_documents').insert([{
                    user_id: userId,
                    title: fieldData.title || documentType,
                    category: 'professional',
                    doc_type: documentType,
                    content_raw: result.rawHtml,
                    content_formatted: result.formattedHtml
                }]);
            } catch (dbError) {
                console.error('[Supabase Save Error - Professional]', dbError);
            }
        }

        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('[Professional Controller Error]', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate professional document. ' + error.message 
        });
    }
};
