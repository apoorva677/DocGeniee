from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import logging
import tempfile
import os
from typing import Optional, Dict
from fastapi.responses import FileResponse
from backend.modules.export_engine import ExportEngine
from backend.modules.template_engine import TemplateEngine

from backend.modules.content_processor import ContentProcessor
from backend.modules.ai_generator import AIGenerator
from backend.modules.structure_classifier import StructureClassifier
from backend.modules.formatting_engine import FormattingEngine
from backend.modules.quality_evaluator import QualityEvaluator
from backend.models.document_model import Document
from backend.db_manager import Database
from backend.auth import authenticate_user, create_access_token, verify_token, hash_password

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        username = verify_token(token)
        db = Database()
        user = db.get_user_by_username(username)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@app.post("/register")
def register(request: RegisterRequest):
    db = Database()
    if db.get_user_by_username(request.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    pwd_hash = hash_password(request.password)
    try:
        db.create_user(request.username, request.email, pwd_hash)
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error creating user")

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user[1]})
    return {"access_token": access_token, "token_type": "bearer"}

class GenerateRequest(BaseModel):
    title: str
    content: str
    type: str
    style: str
    template: str = "default"
    placeholders: Optional[Dict[str, str]] = None

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
        generator = AIGenerator()
        document = generator.enhance_document(document)
        classifier = StructureClassifier()
        document = classifier.classify(document)
        
        template_engine = TemplateEngine()
        document = template_engine.apply_template(document, request.placeholders or {})
        
        formatter = FormattingEngine()
        document = formatter.apply_formatting(document)
        evaluator = QualityEvaluator()
        metrics = evaluator.evaluate(document)
        document.metadata = metrics
        
        db = Database()
        db.save_document(current_user[0], document)
        return document
    except Exception as e:
        logging.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Document generation failed: {str(e)}")

class ExportRequest(BaseModel):
    document: Document
    format: str

@app.post("/export")
def export_document(request: ExportRequest, current_user = Depends(get_current_user)):
    try:
        engine = ExportEngine()
        tf = tempfile.NamedTemporaryFile(delete=False, suffix=f".{request.format}")
        if request.format == "docx":
            engine.export_docx(request.document, tf.name)
        elif request.format == "pdf":
            engine.export_pdf(request.document, tf.name)
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
        return FileResponse(tf.name, media_type='application/octet-stream', filename=f"{request.document.title}.{request.format}")
    except Exception as e:
        logging.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail="Export failed")