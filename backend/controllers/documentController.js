const HTMLToDocx = require('html-to-docx');
const puppeteer = require('puppeteer');
const { supabaseAdmin } = require('../config/supabase');
const path = require('path');
const documentExportService = require('../services/documentExportService');
const aiContentService = require('../services/aiContentService');

/**
 * Document Export Controller
 * Unifies all document downloads into a single service call.
 */
exports.exportDocument = async (req, res) => {
    try {
        const { html, title, format } = req.body;

        if (!html || !format) {
            return res.status(400).json({ success: false, error: 'HTML content and format are required' });
        }

        const fileName = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (format === 'pdf') {
            const pdfBuffer = await documentExportService.exportToPdf(html, title);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            return res.send(pdfBuffer);

        } else if (format === 'docx') {
            const docxBuffer = await documentExportService.exportToDocx(html);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.docx`);
            return res.send(docxBuffer);

        } else {
            return res.status(400).json({ success: false, error: 'Invalid format. Use pdf or docx.' });
        }
    } catch (error) {
        console.error('[Export Controller Error]:', error);
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
        const userId = req.headers['x-user-id'] || req.query.userId;
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User registration/login required.' });
        }

        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
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
        const { title, userId: bodyUserId, documentType, source, content, htmlContent, format } = req.body;
        const userId = bodyUserId || req.headers['x-user-id'];

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
        const userId = req.headers['x-user-id'] || req.query.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User registration/login required.' });
        }

        // Get document to find file_url for storage deletion
        const { data: doc, error: getError } = await supabaseAdmin
            .from('documents')
            .select('file_url, user_id')
            .eq('id', id)
            .eq('user_id', userId)
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
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ success: true, message: 'Document deleted successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Improve a document using AI (grammar, clarity, structure)
 */
exports.improveDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id'] || req.query.userId;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User registration/login required.' });
        }

        // Fetch document
        const { data: doc, error: fetchError } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !doc) {
            return res.status(404).json({ success: false, error: 'Document not found.' });
        }

        const originalContent = doc.content || '';

        // Strip HTML tags for AI processing
        const plainText = originalContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        if (!plainText) {
            return res.status(400).json({ success: false, error: 'Document has no text content to improve.' });
        }

        // Use Groq AI to improve the content
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert document editor. Your task is to improve the provided document text by:
1. Fixing all grammar and spelling errors
2. Improving sentence clarity and flow
3. Enhancing paragraph structure
4. Making the language more professional and precise

Return the improved text as clean HTML using only <h2>, <h3>, <p>, <ul>, <li>, <strong> tags.
Preserve all original information and sections. Do NOT summarize or shorten. Output ONLY the improved HTML.`
                },
                {
                    role: 'user',
                    content: plainText
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 4000
        });

        const improvedContent = completion.choices[0].message.content.trim();

        res.json({
            success: true,
            original: originalContent,
            improved: improvedContent,
            title: doc.title,
            documentType: doc.document_type
        });

    } catch (error) {
        console.error('[Improve Document Error]:', error);
        res.status(500).json({ success: false, error: 'Failed to improve document: ' + error.message });
    }
};
