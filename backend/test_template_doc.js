/**
 * Quick backend test for template-doc endpoints.
 * Run: node test_template_doc.js
 */

const fs = require('fs');
const path = require('path');

async function testParseTemplate() {
    console.log('\n=== Testing /api/template-doc/parse-template ===');
    const { FormData, Blob } = require('buffer') || {};
    
    // Use the existing dummy.pdf for testing
    const pdfPath = path.join(__dirname, 'dummy.pdf');
    if (!fs.existsSync(pdfPath)) {
        console.log('No dummy.pdf found, skipping parse test.');
        return null;
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    const formData = new global.FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('templateFile', blob, 'dummy.pdf');

    const res = await fetch('http://localhost:5000/api/template-doc/parse-template', {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (data.success) {
        console.log('✓ Parse SUCCESS');
        console.log('  Title:', data.structure.title);
        console.log('  Sections:', data.structure.sections);
        return data.structure;
    } else {
        console.error('✗ Parse FAILED:', data.error);
        return null;
    }
}

async function testGenerate(structure) {
    console.log('\n=== Testing /api/template-doc/generate ===');
    const testStructure = structure || {
        title: 'Research Paper',
        sections: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion']
    };

    const res = await fetch('http://localhost:5000/api/template-doc/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            templateStructure: testStructure,
            userDetails: {
                title: 'AI in Modern Healthcare',
                author: 'Test User',
                organization: 'DOC GENIE Labs',
                purpose: 'Academic research paper',
                keyPoints: 'AI diagnostics, machine learning in radiology, predictive analytics'
            }
        })
    });

    const data = await res.json();
    if (data.success) {
        console.log('✓ Generate SUCCESS');
        console.log('  Title:', data.data.title);
        console.log('  HTML length:', data.data.formattedHtml?.length);
        return data.data.formattedHtml;
    } else {
        console.error('✗ Generate FAILED:', data.error);
        return null;
    }
}

async function testDownload(html) {
    if (!html) { console.log('Skipping download test — no HTML.'); return; }
    console.log('\n=== Testing /api/template-doc/download (PDF) ===');

    const res = await fetch('http://localhost:5000/api/template-doc/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, title: 'Test Template Doc', format: 'pdf' })
    });

    if (res.ok) {
        const buf = await res.arrayBuffer();
        fs.writeFileSync('test_template_output.pdf', Buffer.from(buf));
        console.log('✓ Download PDF SUCCESS — size:', buf.byteLength);
    } else {
        console.error('✗ Download FAILED:', await res.text());
    }
}

async function run() {
    try {
        const structure = await testParseTemplate();
        const html = await testGenerate(structure);
        await testDownload(html);
        console.log('\n✅ All template-doc tests complete.\n');
    } catch (err) {
        console.error('Test Error:', err.message);
    }
}

run();
