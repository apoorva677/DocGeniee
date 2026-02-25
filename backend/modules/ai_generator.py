from ..models.document_model import Document, Section, Block


class AIGenerator:
    """
    AIGenerator handles AI-powered enhancement of document content.
    It simulates AI processing by expanding paragraphs and adding context-specific explanations.
    """

    def enhance_paragraph(self, text: str, document_type: str) -> str:
        """
        Enhance a paragraph by expanding it slightly and adding a document-type-specific explanation.
        This simulates AI enhancement without calling external APIs.

        - Expands the text with additional phrasing.
        - Adds a tailored sentence based on document_type (e.g., academic, technical, etc.).
        """
        # Basic expansion
        enhanced_text = text + " This is an enhanced version for better clarity."

        # Add type-specific explanation
        if document_type.lower() == "academic":
            enhanced_text += " In academic contexts, this concept is widely discussed and supported by research."
        elif document_type.lower() == "technical":
            enhanced_text += " Technically, this involves specific implementations and best practices."
        elif document_type.lower() == "business":
            enhanced_text += " In business settings, this approach can lead to improved efficiency and outcomes."
        elif document_type.lower() == "proposal":
            enhanced_text += " For proposals, this element strengthens the overall argument and feasibility."
        else:
            enhanced_text += " This enhancement provides additional depth to the content."

        return enhanced_text

    def enhance_document(self, document: Document) -> Document:
        """
        Enhance the entire document by processing each paragraph block.
        - Loops through all sections and their blocks.
        - Enhances only blocks of type 'paragraph'.
        - Leaves headings and other block types unchanged.
        - Returns the updated Document object (modified in place).
        """
        for section in document.sections:
            for block in section.blocks:
                if block.type == "paragraph":
                    block.content = self.enhance_paragraph(block.content, document.document_type)

        return document