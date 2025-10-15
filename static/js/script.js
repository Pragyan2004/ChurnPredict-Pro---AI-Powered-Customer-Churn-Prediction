class ChurnPredictor {
    constructor() {
        this.initEventListeners();
        this.loadDashboardData();
        this.initNavbarScroll();
    }

    initEventListeners() {
        const predictForm = document.getElementById('predictForm');
        if (predictForm) {
            predictForm.addEventListener('submit', (e) => this.handlePrediction(e));
        }
    }

    initNavbarScroll() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    async handlePrediction(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.displayResult(result);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.displayError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayResult(result) {
        const resultDiv = document.getElementById('predictionResult');
        const probability = result.churn_probability;
        
        let riskClass = 'probability-low';
        let badgeClass = 'badge-success';
        let riskText = 'Low Risk';
        let riskColor = '#10b981';
        
        if (probability > 70) {
            riskClass = 'probability-high';
            badgeClass = 'badge-danger';
            riskText = 'High Risk';
            riskColor = '#ef4444';
        } else if (probability > 40) {
            riskClass = 'probability-medium';
            badgeClass = 'badge-warning';
            riskText = 'Medium Risk';
            riskColor = '#f59e0b';
        }
        
        let retentionTipsHTML = '';
        if (result.retention_tips && result.retention_tips.length > 0) {
            retentionTipsHTML = `
                <div class="retention-tips">
                    <h4>🎯 Retention Recommendations</h4>
                    <ul>
                        ${result.retention_tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3>Prediction Result</h3>
                <div class="probability-circle ${riskClass}" style="--p: ${probability}%">
                    <span>${probability}%</span>
                </div>
                <div class="prediction-badge ${badgeClass}">
                    Churn Prediction: ${result.churn_prediction}
                </div>
                <p><strong>Risk Level:</strong> ${riskText}</p>
                <p class="text-muted">Based on advanced AI analysis of customer data</p>
                ${retentionTipsHTML}
            </div>
        `;
        
        resultDiv.style.display = 'block';
        
        this.animateValue(document.querySelector('.probability-circle span'), 0, probability, 1500);
    }

    displayError(message) {
        const resultDiv = document.getElementById('predictionResult');
        resultDiv.innerHTML = `
            <div class="result-card">
                <div style="color: var(--danger); font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Prediction Error</h3>
                <p>${message}</p>
                <p style="margin-top: 1rem; color: var(--gray);">Please check your input and try again.</p>
            </div>
        `;
        resultDiv.style.display = 'block';
    }

    showLoading() {
        const resultDiv = document.getElementById('predictionResult');
        resultDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Analyzing customer data with AI...</p>
                <p style="color: var(--gray); margin-top: 0.5rem;">This may take a few seconds</p>
            </div>
        `;
        resultDiv.style.display = 'block';
    }

    hideLoading() {
    }

    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + '%';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    loadDashboardData() {
        if (document.getElementById('accuracyChart')) {
            this.renderCharts();
        }
    }

    renderCharts() {
        this.renderAccuracyChart();
        this.renderFeatureChart();
        this.renderDistributionChart();
    }

    renderAccuracyChart() {
        const ctx = document.getElementById('accuracyChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Precision', 'Recall', 'F1-Score', 'ROC AUC'],
                datasets: [{
                    label: 'Model Performance',
                    data: [0.82, 0.78, 0.80, 0.86],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(245, 158, 11)',
                        'rgb(16, 185, 129)',
                        'rgb(139, 92, 246)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Model Performance Metrics' }
                },
                scales: {
                    y: { beginAtZero: true, max: 1.0 }
                }
            }
        });
    }

    renderFeatureChart() {
        const ctx = document.getElementById('featureChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Contract Type', 'Tenure', 'Monthly Charges', 'Internet Service', 'Payment Method'],
                datasets: [{
                    label: 'Feature Importance',
                    data: [0.18, 0.15, 0.12, 0.10, 0.08],
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Top Feature Importance' }
                }
            }
        });
    }

    renderDistributionChart() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 2,
                    borderColor: '#1f2937'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Customer Risk Distribution' }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChurnPredictor();
    
    document.querySelectorAll('.stat-number').forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(el.getAttribute('data-target'));
                    animateStatValue(el, 0, target, 2000);
                    observer.unobserve(el);
                }
            });
        });
        observer.observe(el);
    });
});

function animateStatValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = end.toString().includes('%') ? value + '%' : 
                             end.toString().includes('$') ? '$' + value.toLocaleString() :
                             end.toString().includes('x') ? value.toFixed(1) + 'x' :
                             value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}