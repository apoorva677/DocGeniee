import os
from backend.models.document_model import Document
from backend.modules.content_processor import ContentProcessor
from docx import Document as DocxDocument
from PyPDF2 import PdfReader


class FileProcessor:
    """
    FileProcessor detects file type and extracts text from DOCX or PDF files,
    then converts to Document model using ContentProcessor.
    """

    def process_file(self, file_path: str, title: str, document_type: str, formatting_style: str) -> Document:
        """
        Process a file by detecting type, extracting text, and creating a Document.
        """
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.docx':
            text = self._extract_docx_text(file_path)
        elif ext == '.pdf':
            text = self._extract_pdf_text(file_path)
        else:
            raise ValueError("Unsupported file type")

        processor = ContentProcessor()
        document = processor.process(title, text, document_type, formatting_style)
        return document

    def _extract_docx_text(self, file_path: str) -> str:
        """
        Extract text from DOCX file.
        """
        doc = DocxDocument(file_path)
        text = '\n'.join([p.text for p in doc.paragraphs])
        return text

    def _extract_pdf_text(self, file_path: str) -> str:
        """
        Extract text from PDF file.
        """
        reader = PdfReader(file_path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        return text