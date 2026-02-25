from fastapi import FastAPI
from pydantic import BaseModel
from modules.content_processor import ContentProcessor
from modules.ai_generator import AIGenerator
from models.document_model import Document

app = FastAPI()

class GenerateRequest(BaseModel):
    title: str
    content: str
    type: str  # Maps to document_type
    style: str  # Maps to formatting_style
    template: str = "default"  # Optional, not used in process for now

@app.post("/generate")
def generate_document(request: GenerateRequest) -> Document:
    processor = ContentProcessor()
    document = processor.process(
        title=request.title,
        content=request.content,
        document_type=request.type,
        formatting_style=request.style
    )
    # Enhance the document with AI
    generator = AIGenerator()
    document = generator.enhance_document(document)
    return document