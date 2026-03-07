const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
// To test upload, we need a dummy physical PDF
const dummyPdfPath = path.join(__dirname, 'dummy.pdf');

// Create a dummy file if it doesn't exist
if (!fs.existsSync(dummyPdfPath)) {
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [ 3 0 R ]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources << >>\n/MediaBox [ 0 0 612 792 ]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 55\n>>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(This is a test PDF for extracting structural headings.) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n318\n%%EOF\n');
}

async function runTests() {
    try {
        console.log('1. Testing Template List Fetch (Academic -> Research Paper)');
        const getRes = await axios.get('http://localhost:5000/api/templates/category/academic/type/Research%20Paper');
        console.log('GET Templates:', getRes.data);
        
        console.log('\n2. Testing Example PDF Upload Analysis');
        const formData = new FormData();
        formData.append('category', 'academic');
        formData.append('documentType', 'Research Paper');
        formData.append('examplePdf', fs.createReadStream(dummyPdfPath));

        const postRes = await axios.post('http://localhost:5000/api/templates/upload-example', formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });
        
        console.log('POST Upload Response:', postRes.data);
        
    } catch (e) {
        console.error('Test Failed:', e.response ? e.response.data : e.message);
    }
}

runTests();
