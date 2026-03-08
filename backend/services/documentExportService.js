const HTMLToDocx = require('html-to-docx');
const puppeteer = require('puppeteer');

/**
 * Single Service for Professional Document Export (PDF/DOCX)
 */

/**
 * Generates a high-fidelity PDF buffer using Puppeteer
 * @param {string} html - Formatted document HTML
 * @param {string} title - Document title for headers
 * @returns {Promise<Buffer>}
 */
exports.exportToPdf = async (html, title) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Professional PDF Wrapper with Standard Layout
        const styledHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4; margin: 0; }
                    body { margin: 0; padding: 0; background: white; color: #1a1a1a; font-family: 'Crimson Pro', serif; }
                    .formatted-document {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        min-height: 100vh !important;
                        margin: 0 !important;
                        padding: 1in !important;
                        box-sizing: border-box !important;
                    }
                    h1, h2, h3 { color: #111; line-height: 1.2; margin-top: 1.5em; margin-bottom: 0.8em; }
                    p { line-height: 1.6; margin-bottom: 1em; text-align: justify; font-size: 12pt; }
                    ul, ol { margin-bottom: 1.2em; padding-left: 20pt; }
                    li { margin-bottom: 0.5em; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="formatted-document">
                    ${html}
                </div>
            </body>
            </html>
        `;

        await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 8pt; width: 100%; text-align: right; font-family: 'Times New Roman', serif; padding: 10px 0.5in; color: #777; border-bottom: 0.5px solid #eee;">
                    <span>${title || 'DOC GENIE AI ARCHITECT'}</span>
                </div>`,
            footerTemplate: `
                <div style="font-size: 8pt; width: 100%; text-align: center; font-family: 'Times New Roman', serif; padding: 10px 0; color: #777; border-top: 0.5px solid #eee;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                </div>`,
            margin: { top: '80px', bottom: '80px', right: '0', left: '0' }
        });

        return pdfBuffer;
    } finally {
        if (browser) await browser.close();
    }
};

/**
 * Generates a standard DOCX buffer
 * @param {string} html - HTML content
 * @returns {Promise<Buffer>}
 */
exports.exportToDocx = async (html) => {
    return await HTMLToDocx(html, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });
};

