// js/views/installments.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { EXPENSE_CATEGORIES } from '../config.js';
import { formatCurrency, generateId } from '../modules/utils.js';

const APP_ROOT_ID = 'app-root';

export function renderInstallments(container) {
    const installments = db.getData('installments') || [];
    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Parcelamentos</h1>
            </div>
            <button id="add-installment-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Novo</span>
            </button>
        </header>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
            <p>Registe aqui compras parceladas. O sistema considerará uma parcela por mês como pendente até que o pagamento seja registado.</p>
        </div>
        <section id="installments-list" class="space-y-3">
            ${installments.length > 0 ? installments.map(renderInstallmentItem).join('') : renderEmptyState()}
        </section>
    `;
    if (window.lucide) { window.lucide.createIcons(); }
    document.getElementById('add-installment-btn').addEventListener('click', () => handleInstallmentModal());
    document.getElementById('installments-list').addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-installment-btn');
        if (deleteBtn) handleDeleteInstallment(deleteBtn.dataset.id);
        const detailsBtn = e.target.closest('.details-installment-btn');
        if (detailsBtn) handleDetailsModal(detailsBtn.dataset.id);
    });
}

function renderInstallmentItem(item) {
    const paidCount = (item.payments || []).length;
    const progress = (paidCount / item.totalInstallments) * 100;

    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-bold text-lg">${item.description}</p>
                    <p class="text-sm text-slate-500">Parcela: ${formatCurrency(item.monthlyPayment)}</p>
                    <p class="font-bold text-lg mt-1">${paidCount} / ${item.totalInstallments} pagas</p>
                </div>
                <button class="delete-installment-btn p-1 text-slate-500 hover:text-red-500" data-id="${item.id}"><i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i></button>
            </div>
            <div class="mt-3 mb-4">
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div class="bg-green-500 h-2.5 rounded-full" style="width: ${progress}%"></div></div>
                <p class="text-right text-xs mt-1 font-semibold">Total: ${formatCurrency(item.totalAmount)}</p>
            </div>
            <div class="text-right border-t dark:border-slate-700 pt-3">
                <button data-id="${item.id}" class="details-installment-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Ver Detalhes</button>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-12">
        <i data-lucide="calendar-plus" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i>
        <h3 class="text-xl font-semibold">Nenhum Parcelamento</h3>
        <p class="text-slate-500">Registe aqui compras parceladas ou financiamentos.</p>
    </div>`;
}

async function handleInstallmentModal() {
    const title = 'Novo Parcelamento';
    const contentHTML = `
        <form id="installment-form" class="space-y-4">
            <div><label for="inst-desc" class="form-label">Descrição</label><input type="text" id="inst-desc" name="inst-desc" required class="mt-1 w-full input-style" placeholder="Ex: Compra de Notebook"></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label for="inst-total-amount" class="form-label">Valor Total</label><input type="number" step="0.01" id="inst-total-amount" name="inst-total-amount" required class="mt-1 w-full input-style"></div>
                <div><label for="inst-total-installments" class="form-label">Nº de Parcelas</label><input type="number" id="inst-total-installments" name="inst-total-installments" required class="mt-1 w-full input-style"></div>
            </div>
            <div><label for="inst-start-date" class="form-label">Mês da Primeira Parcela</label><input type="month" id="inst-start-date" name="inst-start-date" required value="${new Date().toISOString().slice(0, 7)}" class="mt-1 w-full input-style"></div>
            <div><label for="inst-category" class="form-label">Categoria</label><select id="inst-category" name="inst-category" required class="mt-1 w-full input-style">${EXPENSE_CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select></div>
        </form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="installment-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('#installment-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const totalAmount = parseFloat(formData.get('inst-total-amount'));
        const totalInstallments = parseInt(formData.get('inst-total-installments'));
        const data = { id: generateId(), description: formData.get('inst-desc'), totalAmount, totalInstallments, monthlyPayment: totalAmount / totalInstallments, payments: [], startDate: formData.get('inst-start-date'), category: formData.get('inst-category') };
        db.addItem('installments', data);
        ui.showToast('Parcelamento criado!', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderInstallments(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDetailsModal(installmentId) {
    const installment = db.getData('installments').find(i => i.id === installmentId);
    if (!installment) return;

    let installmentRows = '';
    for (let i = 1; i <= installment.totalInstallments; i++) {
        const payment = (installment.payments || []).find(p => p.installmentNumber === i);
        const statusHtml = payment
            ? `<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/50 dark:text-green-200 rounded-full">Pago</span>`
            : `<button class="pay-installment-btn bg-indigo-600 text-white font-bold py-1 px-3 rounded-lg text-xs" data-installment-number="${i}">Pagar</button>`;
        installmentRows += `<tr class="border-b dark:border-slate-700"><td class="py-2 px-1">Parcela ${i}</td><td class="py-2 px-1 text-right">${statusHtml}</td></tr>`;
    }

    const title = `Detalhes de ${installment.description}`;
    const contentHTML = `<div class="max-h-80 overflow-y-auto"><table class="w-full text-sm"><tbody>${installmentRows}</tbody></table></div>`;
    const footerHTML = `<button class="close-modal-btn w-full bg-slate-200 dark:bg-slate-600 font-bold py-2 px-4 rounded-lg">Fechar</button>`;
    
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }

    modal.querySelectorAll('.pay-installment-btn').forEach(btn => {
        btn.onclick = () => {
            const installmentNumber = parseInt(btn.dataset.installmentNumber);
            modal.querySelector('.close-modal-btn').click();
            handlePaymentModal(installmentId, installmentNumber);
        };
    });
}

async function handlePaymentModal(installmentId, installmentNumber) {
    const installment = db.getData('installments').find(i => i.id === installmentId);
    const accounts = db.getData('accounts');
    if (!accounts || accounts.length === 0) { ui.showToast('Precisa de ter uma conta para registar um pagamento.', 'error'); return; }
    
    const title = `Pagar Parcela ${installmentNumber}`;
    const contentHTML = `
        <form id="payment-form">
            <p>Confirme o pagamento de <strong>${formatCurrency(installment.monthlyPayment)}</strong> referente a <strong>${installment.description}</strong>.</p>
            <div class="mt-4"><label for="payment-account" class="form-label">Pagar com a conta:</label><select id="payment-account" name="payment-account" required class="mt-1 w-full input-style">${accounts.map(a => `<option value="${a.id}">${a.name} (${formatCurrency(a.balance)})</option>`).join('')}</select></div>
        </form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="payment-form" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Confirmar Pagamento</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('#payment-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const accountId = formData.get('payment-account');
        const account = accounts.find(a => a.id === accountId);
        
        const transactionId = generateId();
        const newTransaction = { id: transactionId, accountId: accountId, type: 'expense', amount: installment.monthlyPayment, description: `${installment.description} (${installmentNumber}/${installment.totalInstallments})`, category: installment.category, date: new Date().toISOString().split('T')[0] };
        db.addItem('transactions', newTransaction);
        db.updateItem('accounts', accountId, { balance: account.balance - installment.monthlyPayment });
        
        const updatedPayments = [...(installment.payments || []), { installmentNumber, transactionId }];
        db.updateItem('installments', installmentId, { payments: updatedPayments });
        
        ui.showToast('Pagamento registado!', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderInstallments(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDeleteInstallment(installmentId) {
    const modal = await ui.createModal("Confirmar Exclusão", "<p>Tem certeza que deseja excluir este parcelamento?</p>", `<div class="flex gap-2"><button class="cancel-btn w-full bg-slate-200 py-2 rounded-lg">Cancelar</button><button class="confirm-delete-btn w-full bg-red-600 text-white py-2 rounded-lg">Excluir</button></div>`);
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.deleteItem('installments', installmentId);
        ui.showToast('Parcelamento excluído.', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderInstallments(document.getElementById(APP_ROOT_ID));
    };
    modal.querySelector('.cancel-btn').onclick = () => modal.querySelector('.close-modal-btn').click();
}