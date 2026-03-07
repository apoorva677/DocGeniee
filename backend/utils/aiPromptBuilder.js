exports.buildPrompt = ({ title, topic, description, contentType, tone, length }) => {
    return `Generate a professional ${contentType} about ${topic}.
Instructions: ${description}.
Tone: ${tone}.
Length: ${length}.
Ensure the content is well structured, clear, and uses the title "${title}" appropriately.`;
};
