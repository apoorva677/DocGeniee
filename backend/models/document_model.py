from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class Block(BaseModel):
    type: str
    content: str
    style: Optional[Dict] = None

class Section(BaseModel):
    heading: str
    level: int
    blocks: List[Block]

class Document(BaseModel):
    title: str
    document_type: str
    formatting_style: str
    sections: List[Section]
    metadata: Optional[Dict] = None