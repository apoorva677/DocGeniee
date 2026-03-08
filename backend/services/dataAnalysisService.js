const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { parse } = require('csv-parse/sync');

/**
 * Data Analysis Service
 * Responsible for parsing datasets and calculating statistics
 */

exports.parseDataset = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const fileBuffer = fs.readFileSync(filePath);

    if (ext === '.csv') {
        return parse(fileBuffer, {
            columns: true,
            skip_empty_lines: true,
            cast: true
        });
    } else if (ext === '.xlsx' || ext === '.xls') {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return xlsx.utils.sheet_to_json(worksheet);
    } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel.');
    }
};

exports.calculateStatistics = (data) => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);
    const rowCount = data.length;
    const colCount = columns.length;

    const stats = {
        rowCount,
        colCount,
        columns: {}
    };

    columns.forEach(col => {
        const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
        
        // Simple type detection
        const isNumeric = values.every(v => !isNaN(parseFloat(v)) && isFinite(v));

        if (isNumeric && values.length > 0) {
            const numValues = values.map(v => parseFloat(v));
            const sum = numValues.reduce((a, b) => a + b, 0);
            const min = Math.min(...numValues);
            const max = Math.max(...numValues);
            const avg = sum / numValues.length;
            
            // Standard Deviation
            const squareDiffs = numValues.map(v => Math.pow(v - avg, 2));
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
            const stdDev = Math.sqrt(avgSquareDiff);

            stats.columns[col] = {
                type: 'numeric',
                min,
                max,
                avg: parseFloat(avg.toFixed(2)),
                sum: parseFloat(sum.toFixed(2)),
                stdDev: parseFloat(stdDev.toFixed(2))
            };
        } else {
            // Categorical
            const counts = {};
            values.forEach(v => {
                const strV = String(v);
                counts[strV] = (counts[strV] || 0) + 1;
            });

            const topValues = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([val, count]) => ({
                    value: val,
                    count,
                    percentage: parseFloat(((count / values.length) * 100).toFixed(2))
                }));

            stats.columns[col] = {
                type: 'categorical',
                uniqueCount: Object.keys(counts).length,
                topValues
            };
        }
    });

    return stats;
};

exports.detectTrends = (data, stats) => {
    const trends = [];

    Object.entries(stats.columns).forEach(([col, colStats]) => {
        if (colStats.type === 'numeric') {
            const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
            
            if (values.length < 2) return;

            // Check for simple monotonicity
            let increasing = true;
            let decreasing = true;

            for (let i = 1; i < values.length; i++) {
                if (values[i] > values[i-1]) decreasing = false;
                if (values[i] < values[i-1]) increasing = false;
            }

            if (increasing) trends.push(`${col} shows a consistent upward trend.`);
            if (decreasing) trends.push(`${col} shows a consistent downward trend.`);

            // Max/Min insights
            trends.push(`Highest ${col} recorded is ${colStats.max}.`);
            trends.push(`Lowest ${col} recorded is ${colStats.min}.`);
        }
    });

    return trends;
};
