from backend.modules.content_processor import ContentProcessor
from backend.modules.ai_generator import AIGenerator
from backend.modules.structure_classifier import StructureClassifier

processor = ContentProcessor()
ai = AIGenerator()
classifier = StructureClassifier()

sample_title = "DOC GENIE Test"

sample_content = """
1. Introduction
This is the introduction section.

1.1 Background
This explains the background of the topic.

2. Conclusion
This concludes the document.
"""

# Step 1: Process raw input
document = processor.process(
    title=sample_title,
    content=sample_content,
    document_type="academic",
    formatting_style="standard"
)

# Step 2: AI enhancement
enhanced_document = ai.enhance_document(document)

# Step 3: Structure classification
classified_document = classifier.classify(enhanced_document)

print(classified_document.model_dump())