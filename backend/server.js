const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const aiContentRoutes = require('./routes/aiContentRoutes');
const professionalDocRoutes = require('./routes/professionalDocRoutes');
const legalDocRoutes = require('./routes/legalDocRoutes');
const academicDocRoutes = require('./routes/academicDocRoutes');
const dataReportRoutes = require('./routes/dataReportRoutes');
const templateRoutes = require('./routes/templateRoutes');
const documentsRoutes = require('./routes/documentsRoutes');
const documentRoutes = require('./routes/documentRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const templateDocumentRoutes = require('./routes/templateDocumentRoutes');
const authRoutes = require('./routes/authRoutes');
const formattingRoutes = require('./routes/formattingRoutes');
const dataAnalyticsRoutes = require('./routes/dataAnalyticsRoutes');

// Use Routes
app.use('/api/ai-content', aiContentRoutes);
app.use('/api/professional-doc', professionalDocRoutes);
app.use('/api/legal-doc', legalDocRoutes);
app.use('/api/academic-doc', academicDocRoutes);
app.use('/api/data-report', dataReportRoutes);
app.use('/api/data-analytics', dataAnalyticsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/document-export', documentRoutes); // Renamed to avoid alias conflict if needed, or kept separate
app.use('/api/document', downloadRoutes); // Standardized endpoint for document downloads
app.use('/api/downloads', downloadRoutes); // Standardized from /api/document or others
app.use('/api/template-doc', templateDocumentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/formatting', formattingRoutes);


// Base route for health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'DOC GENIE Backend is running successfully.' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
