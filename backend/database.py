import sqlite3
import json
from datetime import datetime
from ..models.document_model import Document


class Database:
    """
    Database handles SQLite operations for users and documents.
    """

    def __init__(self, db_path='doc_genie.db'):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.create_tables()

    def create_tables(self):
        self.conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            hashed_password TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )''')
        self.conn.execute('''CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            title TEXT,
            document_type TEXT,
            formatting_style TEXT,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )''')
        self.conn.commit()

    def create_user(self, username: str, email: str, hashed_password: str):
        self.conn.execute('''INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)''',
                          (username, email, hashed_password))
        self.conn.commit()

    def get_user_by_username(self, username: str):
        cursor = self.conn.execute('''SELECT id, username, email, hashed_password FROM users WHERE username = ?''', (username,))
        return cursor.fetchone()

    def save_document(self, user_id: int, document: Document):
        content = json.dumps(document.model_dump())
        self.conn.execute('''INSERT INTO documents (user_id, title, document_type, formatting_style, content) VALUES (?, ?, ?, ?, ?)''',
                          (user_id, document.title, document.document_type, document.formatting_style, content))
        self.conn.commit()

    def get_documents(self, user_id: int):
        cursor = self.conn.execute('''SELECT id, title, document_type, formatting_style, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC''', (user_id,))
        return cursor.fetchall()

    def get_document(self, user_id: int, doc_id: int):
        cursor = self.conn.execute('''SELECT content FROM documents WHERE id = ? AND user_id = ?''', (doc_id, user_id))
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
        return None
