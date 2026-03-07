const HTMLToDocx = require('html-to-docx');
const puppeteer = require('puppeteer');
const { supabaseAdmin } = require('../config/supabase');
const path = require('path');

/**
 * Document Export Controller (Original logic preserved)
 */
exports.exportDocument = async (req, res) => {
    try {
        const { html, title, format } = req.body;

        if (!html || !format) {
            return res.status(400).json({ success: false, error: 'HTML content and format are required' });
        }

        const fileName = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'document';
        let buffer;
        let mimeType;

        if (format === 'docx') {
            buffer = await HTMLToDocx(html, null, {
                table: { row: { cantSplit: true } },
                footer: true,
                pageNumber: true,
            });
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (format === 'pdf') {
            const browser = await puppeteer.launch({ 
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            const styledHtml = `
                <html>
                    <head>
                        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&display=swap" rel="stylesheet">
                        <style>
                            @page { size: A4; margin: 0; }
                            body { margin: 0; padding: 0; background: white; }
                            .formatted-document { box-shadow: none !important; border: none !important; width: 100% !important; min-height: 100vh !important; margin: 0 !important; }
                        </style>
                    </head>
                    <body>${html}</body>
                </html>
            `;

            await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
            
            buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: `<div style="font-size: 9pt; width: 100%; text-align: right; font-family: 'Times New Roman', serif; padding: 0 0.5in; color: #777; border-bottom: 0.5px solid #eee;"><span>${title || 'DOC GENIE Submission'}</span></div>`,
                footerTemplate: `<div style="font-size: 9pt; width: 100%; text-align: center; font-family: 'Times New Roman', serif; padding: 10px 0; color: #777; border-top: 0.5px solid #eee;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
                margin: { top: '80px', bottom: '80px', right: '1in', left: '1in' }
            });

            await browser.close();
            mimeType = 'application/pdf';
        } else {
            return res.status(400).json({ success: false, error: 'Invalid format' });
        }

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}.${format}`);
        return res.send(buffer);

    } catch (error) {
        console.error('[Export Error]:', error);
        res.status(500).json({ success: false, error: 'Failed to export document: ' + error.message });
    }
};

/**
 * Get all documents for a user
 */
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || req.query.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User registration/login required.' });
        }

        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, documents: data });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get a specific document
 */
exports.getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json({ success: true, document: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Save document to DB and Storage
 */
exports.saveDocument = async (req, res) => {
    try {
        const { title, userId, documentType, source, content, htmlContent, format } = req.body;
        
        if (!userId || !title) {
            return res.status(400).json({ success: false, error: 'Title and UserID are required.' });
        }

        let fileUrl = null;

        // If HTML content and format are provided, generate a file and upload to Supabase Storage
        if (htmlContent && format && (format === 'pdf' || format === 'docx')) {
            const fileName = `${Date.now()}_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
            let buffer;
            let mimeType;

            if (format === 'docx') {
                buffer = await HTMLToDocx(htmlContent);
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else {
                const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
                const page = await browser.newPage();
                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                buffer = await page.pdf({ format: 'A4' });
                await browser.close();
                mimeType = 'application/pdf';
            }

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabaseAdmin
                .storage
                .from('documents')
                .upload(`${userId}/${fileName}`, buffer, { contentType: mimeType, upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: publicUrlData } = supabaseAdmin
                .storage
                .from('documents')
                .getPublicUrl(`${userId}/${fileName}`);
            
            fileUrl = publicUrlData.publicUrl;
        }

        // Save to Database
        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert([{
                user_id: userId,
                title,
                document_type: documentType,
                source,
                content,
                file_url: fileUrl
            }])
            .select();

        if (error) throw error;
        res.json({ success: true, document: data[0] });

    } catch (error) {
        console.error('[Save Document Error]:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Delete a document
 */
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Get document to find file_url for storage deletion
        const { data: doc, error: getError } = await supabaseAdmin
            .from('documents')
            .select('file_url, user_id')
            .eq('id', id)
            .single();

        if (getError) throw getError;

        if (doc.file_url) {
            // Extract filename from URL
            const urlParts = doc.file_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            
            await supabaseAdmin
                .storage
                .from('documents')
                .remove([`${doc.user_id}/${fileName}`]);
        }

        const { error } = await supabaseAdmin
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Document deleted successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
