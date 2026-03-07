const HTMLToDocx = require('html-to-docx');
const puppeteer = require('puppeteer');

/**
 * Document Export Controller
 */
exports.exportDocument = async (req, res) => {
    try {
        const { html, title, format } = req.body;

        if (!html || !format) {
            return res.status(400).json({ success: false, error: 'HTML content and format are required' });
        }

        const fileName = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'document';

        if (format === 'docx') {
            const docxBuffer = await HTMLToDocx(html, null, {
                table: { row: { cantSplit: true } },
                footer: true,
                pageNumber: true,
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.docx`);
            return res.send(docxBuffer);
        } else if (format === 'pdf') {
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

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            return res.send(pdfBuffer);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid format' });
        }
    } catch (error) {
        console.error('[Export Error]:', error);
        res.status(500).json({ success: false, error: 'Failed to export document: ' + error.message });
    }
};
