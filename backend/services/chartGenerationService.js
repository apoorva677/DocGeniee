/**
 * Chart Generation Service
 * Prepares chart configurations for the frontend
 */

exports.generateChartData = (data, stats) => {
    const charts = [];

    Object.entries(stats.columns).forEach(([col, colStats]) => {
        if (colStats.type === 'categorical') {
            // Recommendation: Pie or Bar for categorical
            const labels = colStats.topValues.map(v => v.value);
            const counts = colStats.topValues.map(v => v.count);

            charts.push({
                title: `Distribution of ${col}`,
                type: colStats.topValues.length <= 5 ? 'pie' : 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: col,
                        data: counts,
                        backgroundColor: [
                            '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                            '#3b82f6', '#06b6d4', '#ef4444', '#f97316', '#a855f7'
                        ]
                    }]
                }
            });
        } else if (colStats.type === 'numeric') {
            // Recommendation: Histogram or Line (if many points)
            const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
            
            // If data seems sequence-like (many points), offer a line chart
            if (values.length > 5 && values.length <= 100) {
               charts.push({
                   title: `${col} over Records`,
                   type: 'line',
                   data: {
                       labels: Array.from({length: values.length}, (_, i) => i + 1),
                       datasets: [{
                           label: col,
                           data: values,
                           borderColor: '#6366f1',
                           backgroundColor: 'rgba(99, 102, 241, 0.1)',
                           fill: true
                       }]
                   }
               });
            }

            // Always a summary bar for numeric columns
            charts.push({
                title: `${col} Summary Stats`,
                type: 'bar',
                data: {
                    labels: ['Min', 'Max', 'Avg'],
                    datasets: [{
                        label: col,
                        data: [colStats.min, colStats.max, colStats.avg],
                        backgroundColor: ['#ef4444', '#10b981', '#6366f1']
                    }]
                }
            });
        }
    });

    return charts.slice(0, 4); // Limit to top 4 relevant charts
};
