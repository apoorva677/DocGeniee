/**
 * Document Structure Extractor Utility
 * Converts raw text extracted from PDF/DOCX into a structured JSON:
 *   { title: string, sections: string[] }
 *
 * A line is treated as a heading/section if it:
 *   - Has 3–80 characters
 *   - Does NOT end with punctuation like '.', ',', ';', ':', '?'
 *   - Is not purely numeric
 *   - Appears isolated (surrounded by blank lines) OR is in ALL CAPS / Title Case
 */

function isHeadingLine(line, prevLine, nextLine) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 80) return false;

    // Skip lines that end with common paragraph-ending punctuation
    if (/[.,;?]$/.test(trimmed)) return false;

    // Skip pure numbers or page numbers like "1", "Page 1"
    if (/^(page\s*)?\d+$/i.test(trimmed)) return false;

    const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
    const isTitleCase = /^[A-Z][a-zA-Z\s]{2,}$/.test(trimmed) && trimmed.split(' ').every(w => !w || /^[A-Z]/.test(w));
    const isIsolated = (!prevLine || !prevLine.trim()) && (!nextLine || !nextLine.trim());
    const isShortAndClean = trimmed.length <= 50 && !trimmed.includes('  ');

    return isAllCaps || isIsolated || (isTitleCase && isShortAndClean);
}

/**
 * Extracts a structured document schema from raw text.
 * @param {string} rawText - Text extracted from PDF/DOCX
 * @returns {{ title: string, sections: string[] }}
 */
exports.extractStructure = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trimEnd());
    const sections = [];
    let title = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const prev = i > 0 ? lines[i - 1] : '';
        const next = i < lines.length - 1 ? lines[i + 1] : '';

        if (isHeadingLine(line, prev, next)) {
            if (!title) {
                title = line;
            } else {
                // Normalize: capitalize first letter, rest as-is
                const normalized = line.charAt(0).toUpperCase() + line.slice(1);
                if (!sections.includes(normalized)) {
                    sections.push(normalized);
                }
            }
        }
    }

    // Fallback: if no sections detected, create generic ones
    if (sections.length === 0) {
        sections.push('Introduction', 'Main Content', 'Details', 'Conclusion');
    }

    return {
        title: title || 'Document',
        sections
    };
};
