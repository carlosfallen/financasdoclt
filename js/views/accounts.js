// js/views/accounts.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { ACCOUNT_TYPES } from '../config.js';
import { formatCurrency, generateId } from '../modules/utils.js';

const APP_ROOT_ID = 'app-root';

export function renderAccounts(container) {
    const accounts = db.getData('accounts') || [];

    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Contas</h1>
            </div>
            <button id="add-account-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Nova Conta</span>
            </button>
        </header>

        <section id="accounts-list" class="space-y-3">
            ${accounts.length > 0 ? accounts.map(renderAccountItem).join('') : renderEmptyState()}
        </section>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    document.getElementById('add-account-btn').addEventListener('click', () => handleAccountModal());
    
    const list = document.getElementById('accounts-list');
    list.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-account-btn');
        const deleteBtn = e.target.closest('.delete-account-btn');
        if (editBtn) {
            handleAccountModal(editBtn.dataset.id);
        }
        if (deleteBtn) {
            handleDeleteAccount(deleteBtn.dataset.id);
        }
    });
}

function renderAccountItem(account) {
    const accountType = ACCOUNT_TYPES.find(t => t.value === account.type)?.label || 'Não definido';
    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
            <div>
                <p class="font-bold text-lg">${account.name}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">${accountType}</p>
                <p class="font-bold text-xl mt-1">${formatCurrency(account.balance)}</p>
            </div>
            <div class="flex gap-2">
                <button class="edit-account-btn p-2 text-slate-500 hover:text-indigo-500" data-id="${account.id}"><i data-lucide="pencil" class="w-5 h-5 pointer-events-none"></i></button>
                <button class="delete-account-btn p-2 text-slate-500 hover:text-red-500" data-id="${account.id}"><i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i></button>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-12">
        <i data-lucide="credit-card" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i>
        <h3 class="text-xl font-semibold">Nenhuma Conta Cadastrada</h3>
        <p class="text-slate-500">Adicione sua primeira conta para começar a organizar suas finanças.</p>
    </div>`;
}

async function handleAccountModal(accountId = null) {
    const isEditing = accountId !== null;
    const accounts = db.getData('accounts');
    const account = isEditing ? accounts.find(a => a.id === accountId) : null;

    const title = isEditing ? 'Editar Conta' : 'Nova Conta';
    const contentHTML = `
        <form id="account-form" class="space-y-4">
            <input type="hidden" id="account-id" name="accountId" value="${account?.id || ''}">
            <div>
                <label for="account-name" class="form-label">Nome da Conta</label>
                <input type="text" id="account-name" name="account-name" required value="${account?.name || ''}" class="mt-1 w-full input-style">
            </div>
            <div>
                <label for="account-type" class="form-label">Tipo de Conta</label>
                <select id="account-type" name="account-type" required class="mt-1 w-full input-style">
                    ${ACCOUNT_TYPES.map(t => `<option value="${t.value}" ${account?.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
                </select>
            </div>
            <div>
                <label for="account-balance" class="form-label">Saldo Inicial</label>
                <input type="number" step="0.01" id="account-balance" name="account-balance" required value="${account?.balance ?? '0.00'}" ${isEditing ? 'disabled' : ''} class="mt-1 w-full input-style ${isEditing ? 'cursor-not-allowed opacity-50' : ''}">
                ${isEditing ? '<p class="text-xs text-slate-500 mt-1">O saldo é atualizado apenas por transações.</p>' : ''}
            </div>
        </form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="account-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Salvar</button>`;

    const modal = await ui.createModal(title, contentHTML, footerHTML);
    const form = modal.querySelector('#account-form');
    
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            name: formData.get('account-name'),
            type: formData.get('account-type'),
            balance: parseFloat(formData.get('account-balance')),
        };

        if (isEditing) {
            const { balance, ...updateData } = data;
            db.updateItem('accounts', accountId, updateData);
            ui.showToast('Conta atualizada!', 'success');
        } else {
            data.id = generateId();
            db.addItem('accounts', data);
            ui.showToast('Conta criada!', 'success');
        }

        modal.querySelector('.close-modal-btn').click();
        renderAccounts(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDeleteAccount(accountId) {
    const title = "Confirmar Exclusão";
    const contentHTML = "<p>Tem certeza que deseja excluir esta conta? Todas as transações associadas também serão perdidas. Esta ação não pode ser desfeita.</p>";
    const footerHTML = `
        <div class="flex gap-2">
            <button class="cancel-btn w-full bg-slate-200 dark:bg-slate-600 font-bold py-2 px-4 rounded-lg">Cancelar</button>
            <button class="confirm-delete-btn w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Excluir</button>
        </div>`;

    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.deleteItem('accounts', accountId);
        ui.showToast('Conta excluída.', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderAccounts(document.getElementById(APP_ROOT_ID));
    };
    modal.querySelector('.cancel-btn').onclick = () => {
         modal.querySelector('.close-modal-btn').click();
    };
}