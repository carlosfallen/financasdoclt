// js/modules/ui.js

import * as db from './db.js';
import { generateId } from './utils.js';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../config.js';

export function createModal(title, contentHTML, footerHTML) {
    return new Promise((resolve) => {
        const modalId = `modal-${Date.now()}`;
        const modalHTML = `
            <div id="${modalId}" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
                <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scaleIn">
                    <header class="flex justify-between items-center p-4 border-b dark:border-slate-700">
                        <h2 class="text-xl font-bold">${title}</h2>
                        <button class="close-modal-btn text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </header>
                    <main class="p-4 overflow-y-auto">
                        ${contentHTML}
                    </main>
                    <footer class="p-4 border-t dark:border-slate-700">
                        ${footerHTML}
                    </footer>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        if (window.lucide) {
            window.lucide.createIcons();
        }

        const modalElement = document.getElementById(modalId);
        
        const closeModal = () => {
            modalElement.classList.add('animate-fadeOut');
            modalElement.querySelector('div').classList.add('animate-scaleOut');
            setTimeout(() => modalElement.remove(), 300);
        };

        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement || e.target.closest('.close-modal-btn')) {
                closeModal();
            }
        });
        resolve(modalElement);
    });
}

export function showToast(message, type = 'info') {
    const icons = { success: 'check-circle-2', error: 'alert-circle', info: 'info' };
    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };

    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="fixed top-5 right-5 ${colors[type]} text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slideIn">
            <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    setTimeout(() => { 
        document.getElementById(toastId)?.remove(); 
    }, 3000);
}

export async function showTransactionModal() {
    return new Promise((resolve) => {
        const accounts = db.getData('accounts') || [];
        if (accounts.length === 0) {
            showToast('É necessário criar uma conta primeiro!', 'error');
            return resolve(false);
        }

        const title = 'Novo Lançamento';
        const contentHTML = `
            <form id="transaction-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-2">
                    <button type="button" id="type-expense" class="transaction-type-btn active">Despesa</button>
                    <button type="button" id="type-income" class="transaction-type-btn">Receita</button>
                </div>
                <div>
                    <label for="trans-desc" class="form-label">Descrição</label>
                    <input type="text" id="trans-desc" name="trans-desc" required class="input-style mt-1 w-full">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="trans-amount" class="form-label">Valor</label>
                        <input type="number" step="0.01" id="trans-amount" name="trans-amount" required class="input-style mt-1 w-full">
                    </div>
                    <div>
                        <label for="trans-date" class="form-label">Data</label>
                        <input type="date" id="trans-date" name="trans-date" required value="${new Date().toISOString().split('T')[0]}" class="input-style mt-1 w-full">
                    </div>
                </div>
                <div>
                    <label for="trans-account" class="form-label">Conta</label>
                    <select id="trans-account" name="trans-account" required class="input-style mt-1 w-full">
                        ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="trans-category" class="form-label">Categoria</label>
                    <select id="trans-category" name="trans-category" required class="input-style mt-1 w-full"></select>
                </div>
            </form>
            <style>
                .form-label { display: block; font-weight: 500; font-size: .875rem; color: #475569; }
                .dark .form-label { color: #cbd5e1; }
                .input-style { all: unset; box-sizing: border-box; display: block; width: 100%; padding: 8px 12px; border-radius: .5rem; background-color: #f1f5f9; border: 1px solid #cbd5e1; }
                .dark .input-style { background-color: #334155; border-color: #475569; }
                .transaction-type-btn { all: unset; cursor: pointer; text-align: center; padding: 10px; border-radius: .5rem; font-weight: 600; background-color: #e2e8f0; }
                .dark .transaction-type-btn { background-color: #475569; }
                .transaction-type-btn.active { background-color: #4f46e5; color: #fff; }
            </style>
        `;
        const footerHTML = `<button type="submit" form="transaction-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;

        createModal(title, contentHTML, footerHTML).then(modal => {
            const form = modal.querySelector('#transaction-form');
            const categorySelect = form.querySelector('#trans-category');
            let transactionType = 'expense';

            function updateCategories() {
                const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                categorySelect.innerHTML = categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
            }

            modal.querySelectorAll('.transaction-type-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.querySelector('.transaction-type-btn.active').classList.remove('active');
                    btn.classList.add('active');
                    transactionType = btn.id.split('-')[1];
                    updateCategories();
                });
            });

            form.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = {
                    type: transactionType,
                    description: formData.get('trans-desc'),
                    amount: parseFloat(formData.get('trans-amount')),
                    date: formData.get('trans-date'),
                    accountId: formData.get('trans-account'),
                    category: formData.get('trans-category'),
                };

                const account = accounts.find(acc => acc.id === data.accountId);
                if (account) {
                    const newBalance = data.type === 'income' ? account.balance + data.amount : account.balance - data.amount;
                    const newTransaction = { id: generateId(), ...data };

                    db.addItem('transactions', newTransaction);
                    db.updateItem('accounts', data.accountId, { balance: newBalance });

                    showToast('Lançamento salvo!', 'success');
                    modal.querySelector('.close-modal-btn').click();
                    resolve(true);
                } else {
                    showToast('Erro: Conta inválida.', 'error');
                    resolve(false);
                }
            };
            updateCategories();
        });
    });
}

document.head.insertAdjacentHTML('beforeend', `
<style>
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes scaleOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.95); opacity: 0; } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
    .animate-fadeOut { animation: fadeOut 0.3s ease-in forwards; }
    .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
    .animate-scaleOut { animation: scaleOut 0.3s ease-in forwards; }
    .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
</style>
`);