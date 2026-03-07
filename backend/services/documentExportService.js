const HTMLToDocx = require('html-to-docx');
const puppeteer = require('puppeteer');

/**
 * Generates a PDF buffer from HTML content
 */
exports.exportToPdf = async (html, title) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set content with some basic styling for PDF
    const styledHtml = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                    h2 { color: #6366f1; margin-top: 1.5em; }
                    p { margin-bottom: 1em; }
                    ul, ol { margin-bottom: 1em; }
                    li { margin-bottom: 0.5em; }
                </style>
            </head>
            <body>
                <h1>${title || 'DOC GENIE Document'}</h1>
                ${html}
            </body>
        </html>
    `;

    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();
    return pdfBuffer;
};

/**
 * Generates a DOCX buffer from HTML content
 */
exports.exportToDocx = async (html) => {
    const docxBuffer = await HTMLToDocx(html, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });
    return docxBuffer;
};
