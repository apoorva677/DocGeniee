import re
from ..models.document_model import Document, Section, Block


class StructureClassifier:
    """
    StructureClassifier analyzes and classifies the structure of a document.
    It assigns hierarchy levels to sections based on heading numbering and detects list items in blocks.
    """

    def classify(self, document: Document) -> Document:
        """
        Classify the document structure:
        - Analyze section headings for numbered hierarchy (e.g., "1.", "1.1", "2.3.4")
        - Assign levels based on numbering depth
        - Detect bullet list items in blocks and change type to 'list'
        - Leaves paragraph content and other structures intact
        """
        for section in document.sections:
            # Classify heading level
            section.level = self._classify_heading_level(section.heading)

            # Classify blocks
            for block in section.blocks:
                if self._is_list_item(block.content):
                    block.type = "list"

        return document

    def _classify_heading_level(self, heading: str) -> int:
        """
        Determine the hierarchy level of a heading.
        - If numbered (e.g., "1.", "1.1"), level = number of numeric parts
        - Otherwise, default to level 1
        """
        # Match patterns like "1.", "1.1", "2.3.4"
        match = re.match(r'^\d+(\.\d+)*', heading.strip())
        if match:
            numbered_part = match.group(0)
            # Count the number of numeric parts
            level = len(re.findall(r'\d+', numbered_part))
            return level
        else:
            return 1

    def _is_list_item(self, content: str) -> bool:
        """
        Check if a block content represents a list item.
        - Starts with '-', '*', or '•' (optionally followed by space)
        """
        stripped = content.strip()
        return stripped.startswith(('-', '*', '•'))