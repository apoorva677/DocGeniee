# DocGeniee 🧞‍♂️

DocGeniee is an AI-powered document automation platform that simplifies document creation and formatting. It uses advanced AI models to generate professional, legal, academic, and business documents with intelligent formatting.

## 🚀 Key Features

- **Professional Document Generator**: Create resumes, business proposals, and more.
- **Legal Document Generator**: Generate NDAs, service contracts, and legal agreements.
- **Academic Document Generator**: Create reports, assignments, and research papers.
- **Intelligent Formatting Engine**: Automatically detect document types and apply consistent styles.
- **AI Content Generator**: Generate high-quality content sections for any document.
- **Data Analysis**: Explore IIT JEE seat allocation data using an interactive Streamlit dashboard.
- **Template-Based Generation**: Upload your own templates to generate structured documents.

## 🛠️ Project Structure

```text
DocGeniee/
├── backend/            # Express.js Server
│   ├── controllers/    # Request handlers
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic & AI integration
│   ├── utils/          # Helpers & document parsers
│   └── uploads/        # Temporary storage for uploads
├── frontend/           # Vanilla HTML/CSS/JS files
├── requirements.txt    # Python dependencies
└── package.json        # Node.js dependencies
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **Groq API Key** (or other supported AI provider)

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   GROQ_API_KEY=your_api_key_here
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Python Services Setup (Data Analysis)
1. From the root directory, install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Ensure you have `streamlit` installed:
   ```bash
   python -m streamlit --version
   ```

### 4. Frontend Usage
Simply open `frontend/login.html` or `frontend/home.html` in your browser. The frontend is configured to connect to the backend running at `http://127.0.0.1:5000`.

## 🧪 Testing
The backend includes several test scripts:
- `node backend/test_auth.js`
- `node backend/test_template_doc.js`
- `node backend/test_export.js`

## 📄 License
This project is licensed under the ISC License.
