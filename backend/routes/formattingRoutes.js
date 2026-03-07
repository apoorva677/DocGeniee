const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const formattingController = require('../controllers/formattingController');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route to format raw content (existing)
router.post('/format', formattingController.formatContent);

// Route to format uploaded document (new)
router.post('/format-document', upload.single('file'), formattingController.formatUploadedDocument);

module.exports = router;
