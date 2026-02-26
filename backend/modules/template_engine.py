from typing import Dict
from backend.models.document_model import Document


class TemplateEngine:
    """
    TemplateEngine handles placeholder replacement in document content.
    """

    def apply_template(self, document: Document, placeholders: Dict[str, str]) -> Document:
        """
        Replace placeholders in section headings and block contents.
        Placeholders should be in format {{KEY}}.
        """
        for section in document.sections:
            # Replace in heading
            for key, value in placeholders.items():
                section.heading = section.heading.replace("{{" + key + "}}", value)
            # Replace in blocks
            for block in section.blocks:
                for key, value in placeholders.items():
                    block.content = block.content.replace("{{" + key + "}}", value)
        return document