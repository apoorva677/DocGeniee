from backend.models.document_model import Document


class FormattingEngine:
    """
    FormattingEngine applies formatting styles to document blocks based on type, document type, and heading levels.
    """

    def __init__(self):
        self.themes = {
            "academic": {
                "heading": {"font-size": "14pt", "font-weight": "bold", "font-family": "Times New Roman"},
                "paragraph": {"font-size": "12pt", "font-family": "Times New Roman", "line-height": "1.5"},
                "list": {"font-size": "12pt", "font-family": "Times New Roman"}
            },
            "business": {
                "heading": {"font-size": "16pt", "font-weight": "bold", "font-family": "Arial"},
                "paragraph": {"font-size": "11pt", "font-family": "Arial", "line-height": "1.4"},
                "list": {"font-size": "11pt", "font-family": "Arial"}
            },
            "technical": {
                "heading": {"font-size": "14pt", "font-weight": "bold", "font-family": "Courier New"},
                "paragraph": {"font-size": "10pt", "font-family": "Courier New", "line-height": "1.2"},
                "list": {"font-size": "10pt", "font-family": "Courier New"}
            }
        }

    def apply_formatting(self, document: Document) -> Document:
        """
        Apply formatting to all blocks in the document based on their type and the document's type.
        Adjust heading styles based on section level.
        """
        theme = self.themes.get(document.document_type, self.themes["academic"])
        for section in document.sections:
            for block in section.blocks:
                if block.type in theme:
                    block.style = theme[block.type].copy()
                    if block.type == "heading":
                        # Adjust font size based on heading level
                        base_size = int(block.style["font-size"].replace("pt", ""))
                        adjusted_size = base_size - (section.level - 1) * 2
                        block.style["font-size"] = f"{max(adjusted_size, 8)}pt"
        return document