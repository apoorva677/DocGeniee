const dataAnalysisService = require('../services/dataAnalysisService');
const chartGenerationService = require('../services/chartGenerationService');
const reportGeneratorService = require('../services/reportGeneratorService');
const path = require('path');
const fs = require('fs');

/**
 * Data Analytics Controller
 * Orchestrates the flow from parsing to report generation
 */

exports.analyzeData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // 1. Parse Dataset
        const data = await dataAnalysisService.parseDataset(filePath);
        
        // 2. Calculate Stats
        const stats = dataAnalysisService.calculateStatistics(data);
        
        // 3. Detect Trends
        const trends = dataAnalysisService.detectTrends(data, stats);
        
        // 4. Generate Chart Data
        const charts = chartGenerationService.generateChartData(data, stats);
        
        // 5. Generate AI Report (Formatted HTML)
        const reportHtml = await reportGeneratorService.generateReport(stats, trends, fileName);

        // 6. Clean up the uploaded file (optional, depends if we want to keep it)
        // fs.unlinkSync(filePath); 

        res.json({
            success: true,
            dataPreview: data.slice(0, 5), // First 5 rows for preview
            stats,
            trends,
            charts,
            reportHtml
        });

    } catch (error) {
        console.error('[Data Analytics Controller Error]:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform data analysis: ' + error.message
        });
    }
};
