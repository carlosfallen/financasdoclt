// js/modules/chart-config.js

const chartInstances = {};

function formatCurrencyTooltip(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function renderDoughnutChart(canvasId, labels, data, legendOptions = {}) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Resumo',
            data: data,
            backgroundColor: ['#4f46e5', '#e5e7eb'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2,
            hoverOffset: 4
        }]
    };

    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: document.body.classList.contains('dark') ? '#cbd5e1' : '#475569' },
                    ...legendOptions
                },
                tooltip: {
                    callbacks: {
                        label: (context) => formatCurrencyTooltip(context.parsed)
                    }
                }
            }
        },
    };

    chartInstances[canvasId] = new Chart(ctx, config);
}

export function renderBarChart(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const isDarkMode = document.body.classList.contains('dark');
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const labelColor = isDarkMode ? '#cbd5e1' : '#475569';

    const chartData = {
        labels: labels,
        datasets: [{
            label: label,
            data: data,
            backgroundColor: '#4f46e5',
            borderColor: '#3c34b1',
            borderWidth: 1,
            borderRadius: 5
        }]
    };

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${formatCurrencyTooltip(context.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: labelColor,
                        callback: (value) => {
                            if (Math.abs(value) >= 1000000) return 'R$' + (value / 1000000).toFixed(1) + 'M';
                            if (Math.abs(value) >= 1000) return 'R$' + (value / 1000).toFixed(0) + 'k';
                            return 'R$' + value;
                        }
                    },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: labelColor },
                    grid: { display: false }
                }
            }
        }
    };

    chartInstances[canvasId] = new Chart(ctx, config);
}