import re
from typing import List
from ..models.document_model import Document, Section, Block


class ContentProcessor:
    """
    ContentProcessor handles the processing of raw text content into structured document format.
    It cleans, splits, and organizes content into sections and blocks based on headings and paragraphs.
    """

    def clean_text(self, text: str) -> str:
        """
        Normalize whitespace and remove extra blank lines from the text.
        - Replace multiple spaces with single space.
        - Replace multiple newlines with double newline to preserve paragraph breaks.
        """
        # Replace multiple spaces with single space
        text = re.sub(r' +', ' ', text.strip())
        # Replace multiple newlines with double newline
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        return text

    def split_into_lines(self, text: str) -> List[str]:
        """
        Split the cleaned text into lines, trimming each line and filtering out empty ones.
        """
        lines = text.split('\n')
        return [line.strip() for line in lines if line.strip()]

    def is_heading(self, line: str) -> bool:
        """
        Determine if a line is a heading based on rules:
        - Numbered headings: starts with digits and dots, e.g., "1.", "1.1", "2.3.4."
        - Other headings: short line (<60 chars), does not end with period, starts with uppercase letter
        """
        stripped = line.strip()
        # Check for numbered headings
        if re.match(r'^\d+(\.\d+)*\.', stripped):
            return True
        # Check for other headings
        if len(stripped) < 60 and not stripped.endswith('.') and stripped and stripped[0].isupper():
            return True
        return False

    def process(self, title: str, content: str, document_type: str, formatting_style: str) -> Document:
        """
        Process the content into a structured Document object.
        - Clean the content
        - Split into lines
        - Detect headings and create new sections for each
        - Group paragraphs under the current section
        - If no headings, create a default "Introduction" section
        - Create Section and Block objects
        - Return the complete Document
        """
        # Clean the content
        cleaned_content = self.clean_text(content)
        # Split into lines
        lines = self.split_into_lines(cleaned_content)

        sections: List[Section] = []
        current_section: Section = None

        for line in lines:
            if self.is_heading(line):
                # Create a new section for the heading
                current_section = Section(
                    heading=line,
                    level=1,  # Default level; will be classified later
                    blocks=[]
                )
                sections.append(current_section)
            else:
                # If no current section exists, create a default introduction section
                if not current_section:
                    current_section = Section(
                        heading="Introduction",
                        level=1,
                        blocks=[]
                    )
                    sections.append(current_section)
                # Add as a paragraph block under the current section
                block = Block(
                    type="paragraph",
                    content=line
                )
                current_section.blocks.append(block)

        # Create the Document
        document = Document(
            title=title,
            document_type=document_type,
            formatting_style=formatting_style,
            sections=sections,
            metadata={}  # Optional, can be extended later
        )

        return document