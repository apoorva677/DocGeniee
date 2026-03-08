exports.format = async (params) => {
    let { title, content, formattingType, alignment, fontSize, boldHeadings, lineSpacing, documentTheme } = params;
    
    console.log(`[Formatting Service]: Rendering ${documentTheme || 'Modern'} structure for: ${formattingType}`);
    
    if (!content) throw new Error('Content is required for formatting');

    const type = formattingType || 'General Document';
    const theme = documentTheme || 'Modern';

    // Theme Configuration
    const themeMap = {
        'Modern': { accent: '#6366f1', font: "'Inter', sans-serif", bg: '#fff' },
        'Classic': { accent: '#000', font: "'Times New Roman', serif", bg: '#fff' },
        'Minimal': { accent: '#eee', font: "'Inter', sans-serif", bg: '#fafafa' },
        'Bold': { accent: '#1a1a1a', font: "'Space Grotesk', sans-serif", bg: '#fff' }
    };
    const t = themeMap[theme] || themeMap['Modern'];

    const config = {
        fontFamily: t.font,
        bodySize: fontSize ? `${fontSize}pt` : '12pt',
        headingSize: fontSize ? `${parseInt(fontSize) + 4}pt` : '16pt',
        lineSpacing: lineSpacing || '1.5',
        alignment: (alignment || 'justified').toLowerCase(),
        boldHeadings: boldHeadings === 'true' || boldHeadings === true
    };

    // 1. Semantic Tag Parser (Tag-based structure)
    const parseTaggedContent = (text) => {
        // First strip any closing tags like [/TITLE], [/ADDRESS] etc.
        const stripped = text.replace(/\[\/[A-Z_]+\]/g, '').trim();
        
        const segments = [];
        // Regex to match [TAG]...[/TAG] OR [TAG]...[NEXT_TAG]
        const regex = /\[([A-Z_]+)\]([\s\S]*?)(\[\/\1\]|(?=\[[A-Z_]+\])|$)/g;
        let match;
        while ((match = regex.exec(stripped)) !== null) {
            const tagContent = match[2].trim();
            if (tagContent.length > 0) {
                segments.push({ tag: match[1], content: tagContent });
            }
        }
        
        // Fallback: split untagged text into paragraphs by newlines
        if (segments.length === 0) {
            const paras = stripped.split(/\n{2,}/).filter(p => p.trim().length > 0);
            if (paras.length > 1) {
                return paras.map(p => ({ tag: 'BODY', content: p.trim() }));
            }
            return [{ tag: 'BODY', content: stripped }];
        }
        return segments;
    };

    const segments = parseTaggedContent(content);

    // 2. High-Fidelity Renderers
    const renderers = {
        'Resume': () => {
            let html = '';
            segments.forEach(seg => {
                if (seg.tag === 'TITLE' || seg.tag === 'ADDRESS') {
                    html += `<div style="text-align: center; margin-bottom: 30pt; padding: 20pt; background: #f8fafc; border-radius: 12pt; border: ${theme === 'Bold' ? '2pt solid #000' : 'none'};">
                        <h1 style="font-size: 28pt; color: ${t.accent}; margin: 0; font-weight: 800; letter-spacing: -0.5pt;">${seg.content}</h1>
                    </div>`;
                } else if (seg.tag === 'SECTION') {
                    html += `<h2 style="font-size: 14pt; color: ${t.accent}; border-bottom: 1.5pt solid ${t.accent}; margin-top: 25pt; margin-bottom: 12pt; text-transform: uppercase; font-weight: 700;">${seg.content}</h2>`;
                } else if (seg.tag === 'LIST_ITEM') {
                    html += `<div style="display: flex; gap: 10pt; margin-bottom: 6pt; font-size: ${config.bodySize};">
                        <span style="color: ${t.accent}; font-weight: bold;">•</span>
                        <span>${seg.content}</span>
                    </div>`;
                } else {
                    html += `<p style="font-size: ${config.bodySize}; line-height: 1.4; margin-bottom: 10pt;">${seg.content}</p>`;
                }
            });
            return html;
        },

        'Letter': () => {
            let html = '';
            segments.forEach(seg => {
                if (seg.tag === 'DATE') html += `<div style="margin-bottom: 25pt; text-align: right; font-weight: 500;">${seg.content}</div>`;
                else if (seg.tag === 'ADDRESS') html += `<div style="margin-bottom: 35pt; line-height: 1.6; border-left: 3pt solid ${t.accent}; padding-left: 15pt;">${seg.content.replace(/\n/g, '<br>')}</div>`;
                else if (seg.tag === 'TITLE') html += `<h1 style="font-size: 18pt; text-align: center; margin-bottom: 30pt; color: ${t.accent};">${seg.content}</h1>`;
                else if (seg.tag === 'CLOSING') html += `<div style="margin-top: 60pt; margin-left: 60%; font-weight: bold;">${seg.content.replace(/\n/g, '<br>')}</div>`;
                else html += `<p style="font-size: ${config.bodySize}; line-height: ${config.lineSpacing}; margin-bottom: 15pt; text-align: left;">${seg.content}</p>`;
            });
            return html;
        },

        'Academic Paper': () => {
            let html = `<div style="text-align: center; padding: 100pt 0;">
                <h1 style="font-size: 32pt; font-weight: 900; margin-bottom: 20pt;">${title || 'Research Document'}</h1>
                <p style="font-size: 16pt; opacity: 0.6;">DOC GENIE: AI Structural Excellence</p>
                <div style="page-break-after: always;"></div>
            </div>`;
            segments.forEach(seg => {
                if (seg.tag === 'ABSTRACT') html += `<div style="margin: 40pt auto; width: 90%; font-style: italic; border: 0.5pt solid #ccc; padding: 25pt; background: #fdfdfd; line-height: 1.8;">
                    <strong style="display: block; text-align: center; text-transform: uppercase; margin-bottom: 10pt; letter-spacing: 2pt;">Abstract</strong>${seg.content}</div>`;
                else if (seg.tag === 'SECTION') html += `<h2 style="font-size: ${config.headingSize}; text-align: center; margin-top: 40pt; margin-bottom: 20pt; border-top: 1pt solid #eee; padding-top: 20pt; font-weight: 800;">${seg.content}</h2>`;
                else html += `<p style="font-size: ${config.bodySize}; line-height: 2.2; margin-bottom: 20pt; text-indent: 2em; text-align: justified;">${seg.content}</p>`;
            });
            return html;
        },

        'Standard': () => {
            let html = `<h1 style="font-size: 26pt; font-weight: 800; text-align: center; margin-bottom: 50pt; color: ${t.accent};">${title || 'Document Preview'}</h1>`;
            segments.forEach(seg => {
                if (seg.tag === 'SECTION') html += `<h2 style="font-size: ${config.headingSize}; padding-left: 10pt; border-left: 4pt solid ${t.accent}; margin-top: 30pt; margin-bottom: 15pt; font-weight: 700;">${seg.content}</h2>`;
                else if (seg.tag === 'LIST_ITEM') html += `<li style="margin-left: 25pt; margin-bottom: 10pt; color: #333;">${seg.content}</li>`;
                else html += `<p style="font-size: ${config.bodySize}; line-height: ${config.lineSpacing}; margin-bottom: 15pt; text-align: ${config.alignment};">${seg.content}</p>`;
            });
            return html;
        }
    };

    // Legal/Contract renderer
    renderers['Legal'] = () => {
        let html = '';
        segments.forEach(seg => {
            if (seg.tag === 'TITLE') {
                html += `<h1 style="font-size: 20pt; text-align: center; font-weight: 800; text-transform: uppercase; margin-bottom: 30pt; color: ${t.accent}; letter-spacing: 1pt;">${seg.content}</h1>`;
            } else if (seg.tag === 'DATE') {
                html += `<div style="text-align: right; font-size: ${config.bodySize}; margin-bottom: 20pt; color: #555;">${seg.content}</div>`;
            } else if (seg.tag === 'ADDRESS') {
                html += `<div style="margin-bottom: 20pt; line-height: 1.8; font-size: ${config.bodySize};">${seg.content.replace(/\n/g, '<br>')}</div>`;
            } else if (seg.tag === 'SECTION') {
                html += `<h2 style="font-size: 13pt; font-weight: 700; text-transform: uppercase; margin-top: 25pt; margin-bottom: 10pt; color: ${t.accent}; border-bottom: 1pt solid ${t.accent}; padding-bottom: 5pt;">${seg.content}</h2>`;
            } else if (seg.tag === 'SUBSECTION') {
                html += `<h3 style="font-size: 12pt; font-weight: 600; margin-top: 15pt; margin-bottom: 8pt;">${seg.content}</h3>`;
            } else if (seg.tag === 'LIST_ITEM') {
                html += `<div style="display: flex; gap: 10pt; margin-bottom: 6pt; font-size: ${config.bodySize};"><span style="font-weight: bold; min-width: 12pt;">•</span><span>${seg.content}</span></div>`;
            } else if (seg.tag === 'CLOSING') {
                html += `<div style="margin-top: 50pt; display: flex; justify-content: space-between;">
                    <div style="width: 45%; text-align: center;"><div style="border-top: 1pt solid #333; padding-top: 8pt; font-weight: bold;">Authorized Signature</div></div>
                    <div style="width: 45%; text-align: center;"><div style="border-top: 1pt solid #333; padding-top: 8pt; font-weight: bold;">Witness Signature</div></div>
                </div>`;
            } else {
                html += `<p style="font-size: ${config.bodySize}; line-height: ${config.lineSpacing}; margin-bottom: 12pt; text-align: justify;">${seg.content}</p>`;
            }
        });
        return html;
    };

    // 3. Document Selection & Wrapping
    let bodyHtml = '';
    if (type === 'Resume') bodyHtml = renderers['Resume']();
    else if (type === 'Letter') bodyHtml = renderers['Letter']();
    else if (type === 'Academic Paper') bodyHtml = renderers['Academic Paper']();
    else if (['Contract', 'Agreement', 'Legal Document', 'Service Agreement'].includes(type)) bodyHtml = renderers['Legal']();
    else bodyHtml = renderers['Standard']();

    const wrapperStyle = `
        font-family: ${config.fontFamily};
        color: #1a1a1a;
        background: ${t.bg};
        margin: 0 auto;
        padding: 1in;
        width: 8.5in;
        min-height: 11in;
        box-shadow: 0 0 50px rgba(0,0,0,0.1);
        border: 1px solid #ddd;
        position: relative;
        box-sizing: border-box;
    `;

    return `
    <div class="formatted-document" style="${wrapperStyle}">
        <div style="font-size: 9pt; color: ${t.accent}; font-weight: bold; border-bottom: 0.5pt solid #eee; margin-bottom: 30pt; padding-bottom: 5pt; text-align: right;">
            ${title || 'PREVIEW'} | ${type}
        </div>
        ${bodyHtml}
        <div style="position: absolute; bottom: 0.5in; left: 0; width: 100%; text-align: center; font-size: 8pt; color: #999; opacity: 0.7;">
            Page 1 of 1 | DOC GENIE AI ARCHITECT
        </div>
    </div>`;
};
