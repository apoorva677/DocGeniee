const documentGenerationService = require('../services/documentGenerationService');
const { supabaseAdmin } = require('../config/supabase');

exports.generateLegalDocument = async (req, res) => {
    try {
        const { documentType, fieldData, userId } = req.body;

        if (!documentType || !fieldData) {
            return res.status(400).json({ 
                success: false, 
                error: 'documentType and fieldData are required.' 
            });
        }

        const result = await documentGenerationService.generateDocument({
            category: 'legal',
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
                    source: 'Legal Generator',
                    content: result.formattedHtml
                }]);

                // Original table
                await supabaseAdmin.from('generated_documents').insert([{
                    user_id: userId,
                    title: fieldData.title || documentType,
                    category: 'legal',
                    doc_type: documentType,
                    content_raw: result.rawHtml,
                    content_formatted: result.formattedHtml
                }]);
            } catch (dbError) {
                console.error('[Supabase Save Error - Legal]', dbError);
            }
        }

        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('[Legal Controller Error]', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate legal document. ' + error.message 
        });
    }
};
