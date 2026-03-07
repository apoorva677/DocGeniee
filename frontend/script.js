// Auth State
let authToken = localStorage.getItem('token');
const API_BASE = 'http://127.0.0.1:8000';
let currentDocument = null;

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const logoutBtn = document.getElementById('logout-btn');

function checkAuth() {
    if (authToken) {
        authSection.style.display = 'none';
        appSection.style.display = 'flex';
        appSection.style.flexDirection = 'column';
        logoutBtn.style.display = 'block';
    } else {
        authSection.style.display = 'block';
        appSection.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}
checkAuth();

document.getElementById('login-btn').addEventListener('click', async () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const msg = document.getElementById('auth-message');
    try {
        const formData = new URLSearchParams();
        formData.append('username', user);
        formData.append('password', pass);
        
        const res = await fetch(`${API_BASE}/token`, {
            method: 'POST',
            body: formData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        if (res.ok) {
            const data = await res.json();
            authToken = data.access_token;
            localStorage.setItem('token', authToken);
            checkAuth();
            msg.textContent = '';
        } else {
            msg.textContent = 'Login failed. Check credentials.';
        }
    } catch(e) { msg.textContent = 'Network error'; }
});

let isRegistering = false;
document.getElementById('register-btn').addEventListener('click', async () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const emailField = document.getElementById('email');
    const msg = document.getElementById('auth-message');

    if (!isRegistering) {
        document.getElementById('email-label').style.display = 'inline-block';
        emailField.style.display = 'inline-block';
        document.getElementById('login-btn').style.display = 'none';
        isRegistering = true;
        msg.textContent = "Please fill out email as well, then click Register again.";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: user, password: pass, email: emailField.value})
        });
        if (res.ok) {
            msg.textContent = 'Registered! Reloading page to login...';
            msg.style.color = 'green';
            setTimeout(() => location.reload(), 2000);
        } else {
            const err = await res.json();
            msg.textContent = `Registration failed: ${err.detail || 'Unknown error'}`;
        }
    } catch(e) { msg.textContent = 'Network error'; }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    authToken = null;
    checkAuth();
});

// Quill Editor Setup
const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
});

document.getElementById('generate-btn').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const type = document.getElementById('type').value;
    const template = document.getElementById('template').value;
    const style = document.getElementById('style').value;
    const content = document.getElementById('content').value;
    const btn = document.getElementById('generate-btn');

    if (!title || !content) {
        alert('Please fill in the document title and content.');
        return;
    }

    btn.textContent = 'Generating... Please wait';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: title,
                type: type,
                template: template,
                style: style,
                content: content,
                placeholders: {
                    "AUTHOR": document.getElementById('username')?.value || "Author",
                    "DATE": new Date().toLocaleDateString()
                }
            })
        });

        if (response.status === 401) {
            alert('Session expired. Please log in again.');
            logoutBtn.click();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        currentDocument = result;
        
        let htmlContent = `<h1>${result.title}</h1>`;
        result.sections.forEach(sec => {
            sec.blocks.forEach(block => {
                let styleStr = '';
                if (block.style) {
                    styleStr = ` style="${Object.entries(block.style).map(([k,v]) => `${k}:${v}`).join(';')}"`;
                }
                if(block.type === 'heading') {
                    const hLevel = (sec.level || 1) + 1;
                    htmlContent += `<h${hLevel}${styleStr}>${block.content}</h${hLevel}>`;
                } else if(block.type === 'paragraph') {
                    htmlContent += `<p${styleStr}>${block.content}</p>`;
                }
            });
        });
        
        quill.clipboard.dangerouslyPasteHTML(htmlContent);

    } catch (error) {
        if(error.message !== 'Unauthorized') {
            console.error('Error generating document:', error);
            alert('Failed to generate document. Please try again.');
        }
    } finally {
        btn.textContent = 'Generate Document';
        btn.disabled = false;
    }
});

document.getElementById('export-btn').addEventListener('click', async () => {
    if (!currentDocument) {
        alert("Please generate a document first.");
        return;
    }
    const format = prompt("Enter export format (pdf or docx):", "pdf")?.toLowerCase();
    if (!format || !['pdf', 'docx'].includes(format)) return;

    try {
        const response = await fetch(`${API_BASE}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ document: currentDocument, format: format })
        });
        if (!response.ok) throw new Error("Export failed on server.");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocument.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch(e) {
        alert(e.message);
    }
});