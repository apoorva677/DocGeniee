document.getElementById('generate-btn').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const type = document.getElementById('type').value;
    const template = document.getElementById('template').value;
    const style = document.getElementById('style').value;
    const content = document.getElementById('content').value;

    if (!title || !content) {
        alert('Please fill in the document title and content.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                type: type,
                template: template,
                style: style,
                content: content
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        document.getElementById('preview-content').textContent = result;
    } catch (error) {
        console.error('Error generating document:', error);
        alert('Failed to generate document. Please try again.');
    }
});

// Export button is UI only for now
document.getElementById('export-btn').addEventListener('click', () => {
    alert('Export functionality not yet implemented.');
});