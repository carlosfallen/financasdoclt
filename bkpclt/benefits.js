// js/views/benefits.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { formatCurrency, generateId } from '../modules/utils.js';

const APP_ROOT_ID = 'app-root';

export function renderBenefits(container) {
    const benefits = db.getData('benefits') || [];
    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Benefícios</h1>
            </div>
            <button id="add-benefit-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Novo</span>
            </button>
        </header>
        <section id="benefits-list" class="space-y-3">
            ${benefits.length > 0 ? benefits.map(renderBenefitItem).join('') : renderEmptyState()}
        </section>
    `;
    if (window.lucide) { window.lucide.createIcons(); }
    document.getElementById('add-benefit-btn').addEventListener('click', () => handleBenefitModal());
    document.getElementById('benefits-list').addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-benefit-btn');
        if (editBtn) handleBenefitModal(editBtn.dataset.id);
        const deleteBtn = e.target.closest('.delete-benefit-btn');
        if (deleteBtn) handleDeleteBenefit(deleteBtn.dataset.id);
    });
}

function renderBenefitItem(benefit) {
    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
            <div>
                <p class="font-bold">${benefit.name}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">Recebido todo dia ${benefit.receiptDay}</p>
                ${benefit.inCash ? '<span class="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full mt-1 inline-block">Entra em caixa</span>' : ''}
            </div>
            <div class="text-right">
                <p class="font-bold text-green-500 text-lg">${formatCurrency(benefit.amount)}</p>
                <div class="flex gap-2 justify-end mt-1">
                     <button class="edit-benefit-btn p-1 text-slate-500 hover:text-indigo-500" data-id="${benefit.id}"><i data-lucide="pencil" class="w-4 h-4 pointer-events-none"></i></button>
                     <button class="delete-benefit-btn p-1 text-slate-500 hover:text-red-500" data-id="${benefit.id}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-12">
        <i data-lucide="gift" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i>
        <h3 class="text-xl font-semibold">Nenhum Benefício Cadastrado</h3>
        <p class="text-slate-500">Adicione benefícios como Vale Alimentação e Refeição.</p>
    </div>`;
}

async function handleBenefitModal(benefitId = null) {
    const isEditing = benefitId !== null;
    const benefit = isEditing ? db.getData('benefits').find(b => b.id === benefitId) : null;
    const title = isEditing ? 'Editar Benefício' : 'Novo Benefício';
    const contentHTML = `
        <form id="benefit-form" class="space-y-4">
            <div>
                <label for="benefit-name" class="form-label">Nome do Benefício</label>
                <input type="text" id="benefit-name" name="benefit-name" required placeholder="Ex: Vale Alimentação" value="${benefit?.name || ''}" class="mt-1 w-full input-style">
            </div>
            <div>
                <label for="benefit-amount" class="form-label">Valor Mensal</label>
                <input type="number" step="0.01" id="benefit-amount" name="benefit-amount" required value="${benefit?.amount || ''}" class="mt-1 w-full input-style">
            </div>
            <div>
                <label for="benefit-receipt-day" class="form-label">Dia do Recebimento</label>
                <input type="number" min="1" max="31" id="benefit-receipt-day" name="benefit-receipt-day" required value="${benefit?.receiptDay || ''}" class="mt-1 w-full input-style">
            </div>
            <div class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                <div class="flex items-start gap-3">
                    <input type="checkbox" id="benefit-in-cash" name="benefit-in-cash" ${benefit?.inCash ? 'checked' : ''} class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 flex-shrink-0">
                    <div>
                        <label for="benefit-in-cash" class="font-semibold text-slate-800 dark:text-slate-100">Este valor entra como dinheiro na conta?</label>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Marque esta opção se o benefício é depositado como dinheiro (ex: ajuda de custo) e não num cartão separado (ex: vale-refeição).</p>
                    </div>
                </div>
            </div>
        </form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="benefit-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('#benefit-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('benefit-name'),
            amount: parseFloat(formData.get('benefit-amount')),
            receiptDay: parseInt(formData.get('benefit-receipt-day')),
            inCash: formData.get('benefit-in-cash') === 'on'
        };
        if (isEditing) {
            db.updateItem('benefits', benefitId, data);
            ui.showToast('Benefício atualizado!', 'success');
        } else {
            data.id = generateId();
            db.addItem('benefits', data);
            ui.showToast('Benefício criado!', 'success');
        }
        modal.querySelector('.close-modal-btn').click();
        renderBenefits(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDeleteBenefit(benefitId) {
    const modal = await ui.createModal(
        "Confirmar Exclusão", 
        "<p>Tem certeza que deseja excluir este benefício?</p>",
        `<div class="flex gap-2"><button class="cancel-btn w-full bg-slate-200 py-2 rounded-lg">Cancelar</button><button class="confirm-delete-btn w-full bg-red-600 text-white py-2 rounded-lg">Excluir</button></div>`
    );
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.deleteItem('benefits', benefitId);
        ui.showToast('Benefício excluído.', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderBenefits(document.getElementById(APP_ROOT_ID));
    };
    modal.querySelector('.cancel-btn').onclick = () => modal.querySelector('.close-modal-btn').click();
}