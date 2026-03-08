const aiContentService = require('./aiContentService');
const formattingService = require('./formattingService');

/**
 * Report Generator Service
 * Converts statistical data into a narrative AI report
 */

exports.generateReport = async (stats, trends, fileName) => {
    // 1. Build a specialized prompt
    const datasetInfo = `Filename: ${fileName}, Rows: ${stats.rowCount}, Columns: ${stats.colCount}`;
    
    let statsStr = '';
    Object.entries(stats.columns).forEach(([col, colStats]) => {
        if (colStats.type === 'numeric') {
            statsStr += `- ${col}: Avg=${colStats.avg}, Min=${colStats.min}, Max=${colStats.max}, Sum=${colStats.sum}\n`;
        } else {
            const top = colStats.topValues.map(v => `${v.value} (${v.count})`).join(', ');
            statsStr += `- ${col}: ${colStats.uniqueCount} unique values. Top: ${top}\n`;
        }
    });

    const prompt = `Generate a comprehensive, insightful Data Analysis Report for the following dataset:
    
Dataset Information:
${datasetInfo}

Detailed Statistics:
${statsStr}

Detected Trends & Insights:
${trends.join('\n')}

The report MUST include the following structured sections via <h2> tags:
1. Introduction: Briefly explain the analysis context.
2. Dataset Overview: Concise summary of columns and data types.
3. Statistical Summary: meaningful interpretation of the metrics.
4. Key Insights: Derivation of actionable insights from top categorical and numeric findings.
5. Trend Analysis: Discussing detected patterns without repeating previous sections.
6. Conclusion: A concise summary of takeaways; do NOT duplicate previous sentences.

Quality Standards:
- All insights must be derived directly from the statistics provided.
- Avoid repetitive statements. Each section must provide unique value.
- Use professional business language.
- Format the output as clean HTML structure inside a <div>.`;

    // 2. Generate Content
    // We use a custom call to Groq via aiContentService or directly if needed, 
    // but we'll stick to the service's structure.
    const rawContent = await aiContentService.generate({
        title: `Analytical Report: ${fileName}`,
        topic: 'Data Analysis',
        description: prompt,
        contentType: 'Analytical Report',
        tone: 'Professional',
        length: 'Long'
    });

    // 3. Refine/Tag Content for the Formatting Engine
    const taggedContent = await aiContentService.refineContent(rawContent, 'Report');

    // 4. Format Content
    const formattedHtml = await formattingService.format({
        title: `Analytical Report: ${fileName}`,
        content: taggedContent,
        formattingType: 'Standard',
        alignment: 'justified',
        fontSize: '12',
        boldHeadings: true,
        documentTheme: 'Modern'
    });

    return formattedHtml;
};
