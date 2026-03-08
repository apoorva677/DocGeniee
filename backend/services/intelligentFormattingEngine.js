/**
 * Intelligent Formatting Engine
 * Wraps generated HTML content from the AI in a clean, professional, standardized layout.
 */
exports.formatDocument = (htmlContent, documentType, category) => {
    // We provide a standardized, clean CSS layout that makes the document look professional
    // This will be useful when rendering in the frontend preview, and when exported to PDF
    
    // CLEANUP: Ensure no internal structural tags (like [TITLE] or [/TITLE]) leak into the final output
    const cleanHtml = htmlContent.replace(/\[\/?(TITLE|ADDRESS|DATE|SECTION|SUBSECTION|BODY|LIST_ITEM|CLOSING|ABSTRACT)\]/g, '').trim();

    const formattedHtml = `
<div class="docgen-formatted-document" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px;">
    <style>
        .docgen-formatted-document h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; font-size: 28px; text-align: center; }
        .docgen-formatted-document h2 { color: #34495e; margin-top: 30px; margin-bottom: 15px; font-size: 22px; border-bottom: 1px solid #ecf0f1; padding-bottom: 5px; }
        .docgen-formatted-document h3 { color: #7f8c8d; margin-top: 20px; margin-bottom: 10px; font-size: 18px; }
        .docgen-formatted-document p { margin-bottom: 15px; text-align: justify; }
        .docgen-formatted-document ul, .docgen-formatted-document ol { margin-bottom: 20px; padding-left: 20px; }
        .docgen-formatted-document li { margin-bottom: 8px; }
        .docgen-formatted-document strong { color: #2c3e50; }
        .docgen-header-meta { text-align: center; color: #7f8c8d; font-size: 14px; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; }
    </style>
    
    <div class="docgen-header-meta">
        ${category.toUpperCase()} • ${documentType.toUpperCase()}
    </div>

    <div class="docgen-content">
        ${cleanHtml}
    </div>
</div>
    `;

    return formattedHtml;
};
