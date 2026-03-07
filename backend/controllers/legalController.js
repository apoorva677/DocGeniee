const documentGenerationService = require('../services/documentGenerationService');

exports.generateLegalDocument = async (req, res) => {
    try {
        const { documentType, fieldData } = req.body;

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
