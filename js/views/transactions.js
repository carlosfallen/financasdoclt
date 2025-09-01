// js/views/transactions.js

import * as db from '../modules/db.js';
import { formatCurrency, formatDate } from '../modules/utils.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../config.js';

export function renderTransactions(container) {
    const transactions = db.getData('transactions') || [];
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Extrato</h1>
        </header>

        <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <input type="month" id="month-filter" class="filter-select w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
            <select id="type-filter" class="filter-select w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                <option value="all">Todos os Tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
            </select>
        </div>

        <section id="transactions-list" class="space-y-2">
            </section>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    const monthFilter = document.getElementById('month-filter');
    const typeFilter = document.getElementById('type-filter');
    
    // Define o valor padrão para o mês atual
    monthFilter.value = new Date().toISOString().slice(0, 7);

    const applyFilters = () => {
        document.getElementById('transactions-list').innerHTML = renderFilteredTransactions(sortedTransactions);
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    monthFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    
    // Aplica o filtro inicial ao carregar a página
    applyFilters();
}

function renderFilteredTransactions(transactions) {
    const monthFilterValue = document.getElementById('month-filter')?.value;
    const typeFilterValue = document.getElementById('type-filter')?.value;

    const filtered = transactions.filter(t => {
        const monthMatch = !monthFilterValue || t.date.startsWith(monthFilterValue);
        const typeMatch = typeFilterValue === 'all' || t.type === typeFilterValue;
        return monthMatch && typeMatch;
    });

    if (filtered.length === 0) {
        return renderEmptyState();
    }
    return filtered.map(renderTransactionItem).join('');
}

function renderTransactionItem(transaction) {
    const isIncome = transaction.type === 'income';
    const amountClass = isIncome ? 'text-green-500' : 'text-red-500';
    const amountSign = isIncome ? '+' : '-';
    const icon = isIncome ? 'arrow-up-circle' : 'arrow-down-circle';
    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    
    const categoryObject = allCategories.find(c => c.value === transaction.category);
    const categoryLabel = categoryObject ? categoryObject.label : (transaction.category || 'Sem Categoria');

    return `
        <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div class="p-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                <i data-lucide="${icon}" class="${amountClass}"></i>
            </div>
            <div class="flex-grow">
                <p class="font-bold">${transaction.description}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">${categoryLabel} &bull; ${formatDate(transaction.date)}</p>
            </div>
            <div class="${amountClass} font-bold text-lg text-right">
                ${amountSign} ${formatCurrency(transaction.amount)}
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="text-center py-12">
            <i data-lucide="folder-search" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i>
            <h3 class="text-xl font-semibold">Nenhuma Transação</h3>
            <p class="text-slate-500">Suas receitas e despesas para este período aparecerão aqui.</p>
        </div>
    `;
}