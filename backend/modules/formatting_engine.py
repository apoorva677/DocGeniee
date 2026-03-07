from backend.models.document_model import Document

class FormattingEngine:
    """
    FormattingEngine applies formatting styles to document blocks based on formatting_style.
    """

    def __init__(self):
        self.themes = {
            "standard": {
                "heading": {"font-size": "14pt", "font-weight": "bold", "font-family": "Arial"},
                "paragraph": {"font-size": "12pt", "font-family": "Arial", "line-height": "1.5"},
                "list": {"font-size": "12pt", "font-family": "Arial"}
            },
            "formal": {
                "heading": {"font-size": "16pt", "font-weight": "bold", "font-family": "Times New Roman"},
                "paragraph": {"font-size": "12pt", "font-family": "Times New Roman", "line-height": "1.6"},
                "list": {"font-size": "12pt", "font-family": "Times New Roman"}
            },
            "modern": {
                "heading": {"font-size": "18pt", "font-weight": "600", "font-family": "Helvetica, sans-serif"},
                "paragraph": {"font-size": "11pt", "font-family": "Helvetica, sans-serif", "line-height": "1.4"},
                "list": {"font-size": "11pt", "font-family": "Helvetica, sans-serif"}
            }
        }

    def apply_formatting(self, document: Document) -> Document:
        """
        Apply formatting to all blocks in the document based on the document's formatting_style.
        """
        style_key = document.formatting_style.lower()
        theme = self.themes.get(style_key, self.themes["standard"])
        for section in document.sections:
            for block in section.blocks:
                if block.type in theme:
                    block.style = theme[block.type].copy()
                    if block.type == "heading":
                        base_size = int(block.style["font-size"].replace("pt", ""))
                        adjusted_size = base_size - (section.level - 1) * 2
                        block.style["font-size"] = f"{max(adjusted_size, 8)}pt"
        return document