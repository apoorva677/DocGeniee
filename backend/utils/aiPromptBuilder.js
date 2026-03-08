exports.buildPrompt = ({ title, topic, description, contentType, tone, length }) => {
    return `Generate a professional, well-structured ${contentType} about ${topic}.
    
Instructions: ${description}.
Tone: ${tone}.
Length: ${length}.
Title: ${title}.

Quality Rules:
1. AVOID REPETITION: Do not repeat sentences or ideas across different sections.
2. UNIQUE CONTENT: Each section must provide fresh, unique information.
3. SUMMARIZATION: Summaries and conclusions must be concise and summarize key insights without repeating earlier paragraphs.
4. PROFESSIONALISM: Use formal wording, avoid redundant sentences, and ensure logical flow.
5. STRUCTURE: Ensure a clear Introduction, Overview, Analysis, and Conclusion structure where applicable.

Ensure the content is high-quality, readable, and strictly relevant to the topic.`;
};
