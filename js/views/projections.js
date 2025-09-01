// js/views/projections.js

import * as db from '../modules/db.js';
import { calculateNet13thSalary, calculateCurrentTotalBalance } from '../modules/calc.js';
import { renderBarChart } from '../modules/chart-config.js';

export function renderProjections(container) {
    container.innerHTML = `
        <header class="flex items-center gap-3 mb-6">
            <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
            <h1 class="text-2xl font-bold">Projeção de Saldo</h1>
        </header>

        <section class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <p class="text-slate-600 dark:text-slate-300 mb-4">
                Esta é uma simulação da evolução do seu património. O cálculo projeta o seu fluxo de caixa mês a mês, considerando todas as suas receitas e despesas recorrentes.
            </p>
            <div class="mb-4">
                <label for="projection-months" class="block text-sm font-medium text-slate-600 dark:text-slate-300">Período da Projeção</label>
                <select id="projection-months" class="mt-1 w-full max-w-xs input-style">
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12" selected>1 Ano</option>
                    <option value="60">5 Anos</option>
                </select>
            </div>
            <div>
                <canvas id="projections-chart"></canvas>
            </div>
        </section>
        <style>.input-style { all: unset; box-sizing: border-box; display: block; padding: 8px 12px; border-radius: 0.5rem; background-color: #f1f5f9; border: 1px solid #cbd5e1; } .dark .input-style { background-color: #334155; border-color: #475569; }</style>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    const projectionSelect = document.getElementById('projection-months');
    
    const drawChart = () => {
        const monthsToProject = parseInt(projectionSelect.value);
        const projectionData = calculateMonthlyProjection(monthsToProject);
        
        renderBarChart(
            'projections-chart',
            projectionData.labels,
            projectionData.data,
            'Saldo Estimado'
        );
    };

    projectionSelect.addEventListener('change', drawChart);
    drawChart();
}

function calculateMonthlyProjection(numberOfMonths) {
    const user = db.getData('user');
    const schedules = db.getData('schedules') || [];
    const accounts = db.getData('accounts') || [];
    const benefits = db.getData('benefits') || [];
    const installments = db.getData('installments') || [];

    if (!user || !user.salary) {
        return { labels: [], data: [] };
    }

    const monthlySalary = user.salary || 0;
    const monthlyBenefits = benefits.filter(b => b.inCash).reduce((sum, b) => sum + b.amount, 0);
    const monthlySchedules = schedules.reduce((sum, s) => sum + s.amount, 0);
    const net13th = calculateNet13thSalary(user.salary);

    const labels = [];
    const data = [];
    let projectedBalance = calculateCurrentTotalBalance(accounts);
    const today = new Date();

    for (let i = 0; i < numberOfMonths; i++) {
        const currentDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        let monthlyIncome = monthlySalary + monthlyBenefits;
        if (currentMonth === 11) { // Dezembro
            monthlyIncome += net13th;
        }

        const activeInstallmentsThisMonth = installments.filter(item => {
            const startDate = new Date(item.startDate + '-01T00:00:00');
            const monthsSinceStart = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth());
            return monthsSinceStart >= 0 && monthsSinceStart < item.totalInstallments;
        }).reduce((sum, item) => sum + item.monthlyPayment, 0);

        const monthlyExpenses = monthlySchedules + activeInstallmentsThisMonth;
        const monthSurplus = monthlyIncome - monthlyExpenses;
        projectedBalance += monthSurplus;
        
        const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(currentDate);
        const yearLabel = currentYear.toString().slice(-2);
        labels.push(`${monthLabel}/${yearLabel}`);
        data.push(projectedBalance);
    }
    
    return { labels, data };
}