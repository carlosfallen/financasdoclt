// js/views/budgets.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { EXPENSE_CATEGORIES } from '../config.js';
import { formatCurrency, generateId } from '../modules/utils.js';
import { renderDoughnutChart } from '../modules/chart-config.js';

const APP_ROOT_ID = 'app-root';
let selectedMonth;

export function renderBudgets(container) {
    if (!selectedMonth) {
        selectedMonth = new Date().toISOString().slice(0, 7);
    }

    const allBudgets = db.getData('budgets') || [];
    const monthBudgets = allBudgets.filter(b => b.month === selectedMonth);

    const allTransactions = db.getData('transactions') || [];
    const monthTransactions = allTransactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense');

    const allSchedules = db.getData('schedules') || [];
    const spendingByCategory = {};

    monthTransactions.forEach(t => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });

    const actualCurrentMonth = new Date().toISOString().slice(0, 7);
    if (selectedMonth === actualCurrentMonth) {
        allSchedules.forEach(s => {
            const isAlreadyPaidViaTransaction = monthTransactions.some(t =>
                t.description.toLowerCase().includes(s.description.toLowerCase()) &&
                t.amount === s.amount
            );
            if (!isAlreadyPaidViaTransaction) {
                spendingByCategory[s.category] = (spendingByCategory[s.category] || 0) + s.amount;
            }
        });
    }

    const totalBudgeted = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);

    container.innerHTML = `
        <header class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Orçamentos</h1>
            <button id="add-budget-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Novo</span>
            </button>
        </header>
        <div class="mb-4">
            <label for="month-selector" class="block text-sm font-medium text-slate-600 dark:text-slate-300">Selecione o Mês</label>
            <input type="month" id="month-selector" value="${selectedMonth}" class="mt-1 w-full input-style">
        </div>
        <section class="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <h2 class="text-lg font-bold text-center mb-4">Resumo do Mês</h2>
            <div class="w-full max-w-xs mx-auto"><canvas id="budget-overview-chart"></canvas></div>
            <div class="mt-4 flex justify-around text-center">
                <div><p class="text-sm text-slate-500 dark:text-slate-400">Orçado</p><p class="font-bold text-lg">${formatCurrency(totalBudgeted)}</p></div>
                <div><p class="text-sm text-slate-500 dark:text-slate-400">Gasto / Comprometido</p><p class="font-bold text-lg">${formatCurrency(totalSpent)}</p></div>
            </div>
        </section>
        <section id="budgets-list" class="space-y-3">
            <h2 class="text-lg font-bold">Orçamentos por Categoria</h2>
            ${monthBudgets.length > 0 ? monthBudgets.map(budget => renderBudgetCategoryItem(budget, spendingByCategory[budget.category] || 0)).join('') : renderEmptyState()}
        </section>
        <style>.input-style{all:unset;box-sizing:border-box;display:block;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;

    if (window.lucide) { window.lucide.createIcons(); }
    if (totalBudgeted > 0 || totalSpent > 0) {
        renderDoughnutChart('budget-overview-chart', ['Gasto', 'Restante'], [totalSpent, Math.max(0, totalBudgeted - totalSpent)], { display: false });
    }
    document.getElementById('add-budget-btn').addEventListener('click', () => handleBudgetModal(selectedMonth));
    document.getElementById('month-selector').addEventListener('change', (e) => {
        selectedMonth = e.target.value;
        renderBudgets(container);
    });
}

function renderBudgetCategoryItem(budget, spent) {
    const category = EXPENSE_CATEGORIES.find(c => c.value === budget.category);
    if (!category) return '';
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;
    let progressBarColor = 'bg-indigo-500';
    if (progress > 75 && progress <= 100) progressBarColor = 'bg-yellow-500';
    if (progress > 100) progressBarColor = 'bg-red-500';

    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-2"><i data-lucide="${category.icon}" class="w-5 h-5 text-slate-500"></i><span class="font-bold">${category.label}</span></div>
                <span class="text-sm font-semibold">${formatCurrency(spent)} / ${formatCurrency(budget.amount)}</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div class="${progressBarColor} h-2.5 rounded-full" style="width:${Math.min(progress,100)}%"></div></div>
            <p class="text-right text-xs mt-1 ${remaining<0?'text-red-500':'text-slate-500'}">${remaining>=0?`${formatCurrency(remaining)} restantes`:`${formatCurrency(Math.abs(remaining))} acima`}</p>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-8"><i data-lucide="clipboard-list" class="w-12 h-12 mx-auto text-slate-400 mb-4"></i><h3 class="text-lg font-semibold">Sem Orçamentos</h3><p class="text-slate-500 text-sm">Crie orçamentos para este mês para começar a acompanhar.</p></div>`;
}

async function handleBudgetModal(month) {
    const budgets = db.getData('budgets') || [];
    const title = 'Novo / Editar Orçamento';
    const contentHTML = `
        <form id="budget-form" class="space-y-4">
            <input type="hidden" name="month" value="${month}">
            <div>
                <label for="budget-category" class="form-label">Categoria</label>
                <select id="budget-category" name="budget-category" required class="mt-1 w-full input-style">
                    ${EXPENSE_CATEGORIES.map(c => {
                        const existingBudget = budgets.find(b => b.month === month && b.category === c.value);
                        return `<option value="${c.value}" data-amount="${existingBudget?.amount||''}">${c.label}</option>`;
                    }).join('')}
                </select>
            </div>
            <div>
                <label for="budget-amount" class="form-label">Valor Orçado</label>
                <input type="number" step="0.01" id="budget-amount" name="budget-amount" required placeholder="Ex: 500,00" class="mt-1 w-full input-style">
            </div>
        </form>
        <p class="text-xs text-slate-500 mt-2">Se já existir um orçamento para a categoria, o valor será atualizado.</p>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="budget-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    const categorySelect = modal.querySelector('#budget-category');
    const amountInput = modal.querySelector('#budget-amount');
    categorySelect.onchange = () => { amountInput.value = categorySelect.options[categorySelect.selectedIndex].dataset.amount || ''; };
    categorySelect.onchange();
    modal.querySelector('#budget-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = { category: formData.get('budget-category'), amount: parseFloat(formData.get('budget-amount')), month: formData.get('month') };
        const existingBudget = budgets.find(b => b.month === data.month && b.category === data.category);
        if (existingBudget) {
            db.updateItem('budgets', existingBudget.id, data);
            ui.showToast('Orçamento atualizado!', 'success');
        } else {
            data.id = generateId();
            db.addItem('budgets', data);
            ui.showToast('Orçamento criado!', 'success');
        }
        modal.querySelector('.close-modal-btn').click();
        renderBudgets(document.getElementById(APP_ROOT_ID));
    };
}