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
            const browser = await puppeteer.launch({ 
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            // Refined Styling for PDF Output (Enforcing Standard Academic Font)
            const styledHtml = `
                <html>
                    <head>
                        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&display=swap" rel="stylesheet">
                        <style>
                            @page {
                                size: A4;
                                margin: 0;
                            }
                            body { 
                                margin: 0;
                                padding: 0;
                                background: white;
                            }
                            .formatted-document {
                                box-shadow: none !important;
                                border: none !important;
                                width: 100% !important;
                                min-height: 100vh !important;
                                margin: 0 !important;
                            }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `;

            await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 9pt; width: 100%; text-align: right; font-family: 'Times New Roman', serif; padding: 0 0.5in; color: #777; border-bottom: 0.5px solid #eee;">
                        <span>${title || 'DOC GENIE Submission'}</span>
                    </div>`,
                footerTemplate: `
                    <div style="font-size: 9pt; width: 100%; text-align: center; font-family: 'Times New Roman', serif; padding: 10px 0; color: #777; border-top: 0.5px solid #eee;">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                    </div>`,
                margin: {
                    top: '80px',
                    bottom: '80px',
                    right: '1in',
                    left: '1in'
                }
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
