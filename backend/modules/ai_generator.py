import os
import logging
from dotenv import load_dotenv

load_dotenv()
from typing import Optional
from openai import OpenAI
from ..models.document_model import Document, Section, Block

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIGenerator:
    """
    AIGenerator handles AI-powered enhancement of document content.
    It connects to the OpenAI API (or compatible API) to generate enhanced paragraphs.
    """
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def enhance_paragraph(self, text: str, document_type: str) -> str:
        """
        Enhance a paragraph using a real LLM API.
        """
        if not self.client:
            logger.warning("No OPENAI_API_KEY found. Using fallback mock implementation.")
            return text + f" [Mock Enhanced: {document_type} context added]"

        prompt = (
            f"You are a professional document writer. Enhance the following paragraph "
            f"to fit a '{document_type}' document style. Improve clarity, vocabulary, "
            f"and professional tone. Do not add any conversational filler, just return "
            f"the improved paragraph.\n\nOriginal Text: {text}"
        )
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional writing assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error calling AI API: {e}")
            return text # fallback to original text on error

    def enhance_document(self, document: Document) -> Document:
        """
        Enhance the entire document by processing each paragraph block.
        """
        for section in document.sections:
            for block in section.blocks:
                if block.type == "paragraph":
                    block.content = self.enhance_paragraph(block.content, document.document_type)

        return document