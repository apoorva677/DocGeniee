const fs = require('fs');
const path = require('path');

/**
 * Loads the template mapping for a specific category and document type.
 */
exports.getTemplate = (category, documentType) => {
    try {
        const filePath = path.join(__dirname, '..', 'templates', `${category}Templates.json`);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`Template file not found for category: ${category}`);
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const templates = JSON.parse(fileContent);
        
        const template = templates[documentType];
        
        if (!template) {
            throw new Error(`Document type '${documentType}' not found in ${category} templates.`);
        }
        
        return template;
    } catch (error) {
        console.error('[Template Service Error]', error);
        throw error;
    }
};
