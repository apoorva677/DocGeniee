const axios = require('axios');

async function testGeneration() {
    try {
        console.log('Testing Academic Generator...');
        const res = await axios.post('http://localhost:5000/api/academic-doc/generate', {
            documentType: 'Research Paper',
            fieldData: {
                title: 'AI in Healthcare',
                author: 'Test User',
                institution: 'Test University',
                topic: 'Impact of AI on Healthcare',
                methodology: 'Literature Review',
            }
        });
        console.log('Success! Formatted HTML length:', res.data.data.formattedHtml.length);
        console.log('First 100 chars:', res.data.data.formattedHtml.substring(0, 100));
    } catch (e) {
        console.error('Test failed:', e.response ? e.response.data : e.message);
    }
}

testGeneration();
