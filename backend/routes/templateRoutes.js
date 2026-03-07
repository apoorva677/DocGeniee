const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// We need multer temporarily configured for parsing uploaded PDFs
const multer = require('multer');
const path = require('path');
const storageDir = path.join(__dirname, '..', 'templates', 'templateStorage');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storageDir);
    },
    filename: (req, file, cb) => {
        // Safe filename with timestamp
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${name}_${Date.now()}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'));
        }
    }
});

// GET endpoints
router.get('/category/:category/type/:docType', templateController.getTemplates);
router.get('/preview/:filename', templateController.previewTemplate);

// POST endpoint for uploads
router.post('/upload-example', upload.single('examplePdf'), templateController.uploadExample);

module.exports = router;
