from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import sqlite3
from backend.modules.content_processor import ContentProcessor
from backend.modules.ai_generator import AIGenerator
from backend.modules.structure_classifier import StructureClassifier
from backend.modules.formatting_engine import FormattingEngine
from backend.modules.quality_evaluator import QualityEvaluator
from backend.models.document_model import Document
from backend.database import Database
from backend.auth import authenticate_user, create_access_token, verify_token, hash_password

app = FastAPI()

class GenerateRequest(BaseModel):
    title: str
    content: str
    type: str  # Maps to document_type
    style: str  # Maps to formatting_style
    template: str = "default"  # Optional, not used in process for now

@app.post("/generate")
def generate_document(request: GenerateRequest, current_user = Depends(get_current_user)) -> Document:
    try:
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
        # Classify structure
        classifier = StructureClassifier()
        document = classifier.classify(document)
        # Apply formatting
        formatter = FormattingEngine()
        document = formatter.apply_formatting(document)
        # Evaluate quality
        evaluator = QualityEvaluator()
        metrics = evaluator.evaluate(document)
        document.metadata = metrics
        # Save to database
        db = Database()
        db.save_document(current_user[0], document)
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")