const fs = require('fs');
const path = require('path');

const storageDir = path.join(__dirname, '..', 'templates', 'templateStorage');
const templatesPath = category => path.join(__dirname, '..', 'templates', `${category}Templates.json`);

/**
 * Get all available templates for a specific document category and type
 */
exports.getTemplatesByDocType = (category, documentType) => {
    try {
        const filePath = templatesPath(category);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        
        const templatesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const typeData = templatesData[documentType];
        
        if (!typeData || !typeData.availableTemplates) {
            // If we don't have custom templates array mapped, return a default "Standard Template" option 
            return [
                {
                    id: 'standard',
                    name: 'Standard Template',
                    description: `A standard ${documentType} structure.`,
                    previewUrl: null // No PDF for strictly the standard basic ones, or we can fallback
                }
            ];
        }
        
        return typeData.availableTemplates;
        
    } catch (error) {
        console.error('[TemplateManager] Error fetching templates', error);
        return [];
    }
};

/**
 * Save a new extracted template layout to the master JSON
 */
exports.saveExtractedTemplate = (category, documentType, newTemplateMetadata, newTemplateStructure) => {
    try {
        const filePath = templatesPath(category);
        let templatesData = {};
        
        if (fs.existsSync(filePath)) {
            templatesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        
        // Ensure doc type exists
        if (!templatesData[documentType]) {
            templatesData[documentType] = { fields: [], structure: [], availableTemplates: [] };
        }
        
        // Initialize availableTemplates array if missing
        if (!templatesData[documentType].availableTemplates) {
            templatesData[documentType].availableTemplates = [];
            // Add the default standard template into the array
            templatesData[documentType].availableTemplates.push({
                id: 'standard',
                name: 'Standard Template',
                description: `Default system template for ${documentType}`,
                structure: templatesData[documentType].structure || [], 
                previewUrl: null
            });
            // Update the main structure point to be the fallback
            if(!templatesData[documentType].structure) {
                 templatesData[documentType].structure = newTemplateStructure;
            }
        }
        
        // Save the new template with its specific structure
        templatesData[documentType].availableTemplates.push({
            id: newTemplateMetadata.id,
            name: newTemplateMetadata.name,
            description: newTemplateMetadata.description,
            previewUrl: `/api/templates/preview/${newTemplateMetadata.filename}`,
            structure: newTemplateStructure // Custom extracted structure
        });

        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(templatesData, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('[TemplateManager] Error saving template', error);
        throw error;
    }
};

/**
 * Fetches the specific structure array for a given template ID
 */
exports.getTemplateStructure = (category, documentType, templateId) => {
    const filePath = templatesPath(category);
    if (!fs.existsSync(filePath)) return null;
    
    const templatesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const typeData = templatesData[documentType];
    
    if (!typeData) return null;
    
    if (templateId === 'standard' || !typeData.availableTemplates) {
        return typeData.structure; // Return default
    }
    
    const customTemplate = typeData.availableTemplates.find(t => t.id === templateId);
    return customTemplate ? customTemplate.structure : typeData.structure;
};

/**
 * Safely resolves the PDF path for a preview stream
 */
exports.resolvePreviewPath = (filename) => {
    // Prevent directory traversal
    const safeFilename = path.basename(filename); 
    const fullPath = path.join(storageDir, safeFilename);
    
    if (fs.existsSync(fullPath)) {
        return fullPath;
    }
    return null;
};
