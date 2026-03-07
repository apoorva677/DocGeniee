const fs = require('fs');

async function testExport() {
    try {
        console.log('Testing PDF Export...');
        const pdfRes = await fetch('http://localhost:5000/api/document/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: '<h2>Test Document</h2><p>This is a test.</p>',
                title: 'Test Doc',
                format: 'pdf'
            })
        });
        
        if (!pdfRes.ok) throw new Error('PDF Failed: ' + await pdfRes.text());
        const pdfBuffer = await pdfRes.arrayBuffer();
        fs.writeFileSync('test_output.pdf', Buffer.from(pdfBuffer));
        console.log('PDF saved correctly (size: ' + pdfBuffer.byteLength + ')');

        console.log('Testing DOCX Export...');
        const docxRes = await fetch('http://localhost:5000/api/document/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: '<h2>Test Document</h2><p>This is a test.</p>',
                title: 'Test Doc',
                format: 'docx'
            })
        });

        if (!docxRes.ok) throw new Error('DOCX Failed: ' + await docxRes.text());
        const docxBuffer = await docxRes.arrayBuffer();
        fs.writeFileSync('test_output.docx', Buffer.from(docxBuffer));
        console.log('DOCX saved correctly (size: ' + docxBuffer.byteLength + ')');
        
    } catch (e) {
        console.error('Test Error:', e);
    }
}

testExport();
