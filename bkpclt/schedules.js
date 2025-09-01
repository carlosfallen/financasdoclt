// js/views/schedules.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { EXPENSE_CATEGORIES } from '../config.js';
import { formatCurrency, generateId } from '../modules/utils.js';

const APP_ROOT_ID = 'app-root';
const currentMonth = new Date().toISOString().slice(0, 7);

export function renderSchedules(container) {
    const schedules = (db.getData('schedules') || []).sort((a, b) => a.dueDate - b.dueDate);
    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
             <div class="flex items-center gap-3">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Agendamentos</h1>
            </div>
            <button id="add-schedule-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Novo</span>
            </button>
        </header>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
            <p>Aqui ficam as suas despesas recorrentes. Registe o pagamento de cada uma delas todos os meses.</p>
        </div>
        <section id="schedules-list" class="space-y-3">
            ${schedules.length > 0 ? schedules.map(renderScheduleItem).join('') : renderEmptyState()}
        </section>
    `;
    if (window.lucide) {
        window.lucide.createIcons();
    }

    document.getElementById('add-schedule-btn').addEventListener('click', () => handleScheduleModal());
    document.getElementById('schedules-list').addEventListener('click', (e) => {
        const payBtn = e.target.closest('.pay-schedule-btn');
        if (payBtn) handlePaymentModal(payBtn.dataset.id);
        const deleteBtn = e.target.closest('.delete-schedule-btn');
        if (deleteBtn) handleDeleteSchedule(deleteBtn.dataset.id);
    });
}

function renderScheduleItem(schedule) {
    const category = EXPENSE_CATEGORIES.find(c => c.value === schedule.category);
    const payments = schedule.payments || [];
    const paidThisMonth = payments.some(p => p.month === currentMonth);

    const statusHtml = paidThisMonth
        ? `<span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/50 dark:text-green-200 rounded-full flex items-center gap-1"><i data-lucide="check" class="w-4 h-4"></i>Pago este mês</span>`
        : `<button data-id="${schedule.id}" class="pay-schedule-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Registar Pagamento</button>`;

    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div class="flex justify-between items-start mb-2">
                 <div class="flex items-center gap-3">
                    <i data-lucide="${category?.icon || 'tag'}" class="w-8 h-8 text-slate-500"></i>
                    <div>
                        <p class="font-bold text-lg">${schedule.description}</p>
                        <p class="text-sm text-slate-500 dark:text-slate-400">Vence todo dia ${schedule.dueDate}</p>
                        <p class="font-bold text-red-500 text-xl">${formatCurrency(schedule.amount)}</p>
                    </div>
                </div>
                <button class="delete-schedule-btn text-slate-500 hover:text-red-500" data-id="${schedule.id}"><i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i></button>
            </div>
            <div class="text-right">
                ${statusHtml}
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-12"><i data-lucide="calendar-off" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i><h3 class="text-xl font-semibold">Nenhum Agendamento</h3><p class="text-slate-500">Cadastre suas contas recorrentes como aluguel e internet.</p></div>`;
}

async function handleScheduleModal(scheduleId = null) {
    const isEditing = scheduleId !== null;
    const schedule = isEditing ? db.getData('schedules').find(s => s.id === scheduleId) : null;
    const title = isEditing ? 'Editar Agendamento' : 'Novo Agendamento';
    const contentHTML = `
        <form id="schedule-form" class="space-y-4">
            <div><label for="schedule-desc" class="form-label">Descrição</label><input type="text" id="schedule-desc" name="schedule-desc" required value="${schedule?.description||''}" class="mt-1 w-full input-style"></div>
            <div><label for="schedule-amount" class="form-label">Valor</label><input type="number" step="0.01" id="schedule-amount" name="schedule-amount" required value="${schedule?.amount||''}" class="mt-1 w-full input-style"></div>
            <div><label for="schedule-due-date" class="form-label">Dia do Vencimento</label><input type="number" min="1" max="31" id="schedule-due-date" name="schedule-due-date" required value="${schedule?.dueDate||''}" class="mt-1 w-full input-style"></div>
            <div><label for="schedule-category" class="form-label">Categoria</label><select id="schedule-category" name="schedule-category" required class="mt-1 w-full input-style">${EXPENSE_CATEGORIES.map(c=>`<option value="${c.value}" ${schedule?.category===c.value?'selected':''}>${c.label}</option>`).join('')}</select></div>
        </form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="schedule-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('#schedule-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = { description: formData.get('schedule-desc'), amount: parseFloat(formData.get('schedule-amount')), dueDate: parseInt(formData.get('schedule-due-date')), category: formData.get('schedule-category') };
        if (isEditing) {
            db.updateItem('schedules', scheduleId, data);
            ui.showToast('Agendamento atualizado!', 'success');
        } else {
            data.id = generateId();
            data.payments = [];
            db.addItem('schedules', data);
            ui.showToast('Agendamento criado!', 'success');
        }
        modal.querySelector('.close-modal-btn').click();
        renderSchedules(document.getElementById(APP_ROOT_ID));
    };
}

async function handlePaymentModal(scheduleId) {
    const schedule = db.getData('schedules').find(s => s.id === scheduleId);
    const accounts = db.getData('accounts');
    if (!accounts || accounts.length === 0) { ui.showToast('Precisa de ter uma conta para registar um pagamento.', 'error'); return; }
    const title = `Pagar ${schedule.description}`;
    const contentHTML = `
        <form id="payment-form">
            <p>Confirme o pagamento de ${formatCurrency(schedule.amount)} para o mês corrente.</p>
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
        const newTransaction = { id: transactionId, accountId: accountId, type: 'expense', amount: schedule.amount, description: schedule.description, category: schedule.category, date: new Date().toISOString().split('T')[0] };
        db.addItem('transactions', newTransaction);
        db.updateItem('accounts', accountId, { balance: account.balance - schedule.amount });
        const updatedPayments = [...(schedule.payments || []), { month: currentMonth, transactionId }];
        db.updateItem('schedules', scheduleId, { payments: updatedPayments });
        ui.showToast('Pagamento registado!', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderSchedules(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDeleteSchedule(scheduleId) {
    const modal = await ui.createModal("Confirmar Exclusão", "<p>Tem certeza que deseja excluir este agendamento recorrente?</p>", `<div class="flex gap-2"><button class="cancel-btn w-full bg-slate-200 py-2 rounded-lg">Cancelar</button><button class="confirm-delete-btn w-full bg-red-600 text-white py-2 rounded-lg">Excluir</button></div>`);
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.deleteItem('schedules', scheduleId);
        ui.showToast('Agendamento excluído.', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderSchedules(document.getElementById(APP_ROOT_ID));
    };
    modal.querySelector('.cancel-btn').onclick = () => modal.querySelector('.close-modal-btn').click();
}