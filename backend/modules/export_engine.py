from backend.models.document_model import Document
from docx import Document as DocxDocument
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


class ExportEngine:
    """
    ExportEngine handles exporting documents to DOCX and PDF formats.
    """

    def export_docx(self, document: Document, path: str):
        """
        Export the document to DOCX format.
        """
        doc = DocxDocument()
        doc.add_heading(document.title, 0)
        for section in document.sections:
            doc.add_heading(section.heading, section.level)
            for block in section.blocks:
                if block.type == "paragraph":
                    doc.add_paragraph(block.content)
                elif block.type == "list":
                    doc.add_paragraph(block.content, style='List Bullet')
        doc.save(path)

    def export_pdf(self, document: Document, path: str):
        """
        Export the document to basic PDF format.
        """
        c = canvas.Canvas(path, pagesize=letter)
        width, height = letter
        y = height - 50
        c.drawString(100, y, document.title)
        y -= 30
        for section in document.sections:
            c.drawString(100, y, section.heading)
            y -= 20
            for block in section.blocks:
                if block.type in ["paragraph", "list"]:
                    c.drawString(120, y, block.content)
                    y -= 15
                    if y < 50:
                        c.showPage()
                        y = height - 50
        c.save()