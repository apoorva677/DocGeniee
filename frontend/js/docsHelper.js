/**
 * Helper to save generated/formatted documents to the history
 * @param {string} content - HTML or Text content
 * @param {string} title - Document title
 * @param {string} type - Document type (General, Academic, Legal, Professional, Formatted)
 * @param {string} source - Origin (Generator, Formatting Engine, Template)
 */
async function saveDocument(content, title, type, source) {
    try {
        const response = await fetch('http://localhost:5000/api/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                title: title || 'Untitled Document',
                type: type || 'General',
                source: source || 'Generator'
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Document saved to history:', data.document.id);
            return data.document;
        } else {
            console.error('Failed to save document:', data.error);
        }
    } catch (err) {
        console.error('Error saving document to history:', err);
    }
}

// Attach to window for global access
window.saveDocument = saveDocument;
