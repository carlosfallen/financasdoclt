// js/views/goals.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { formatCurrency, generateId, formatDate } from '../modules/utils.js';

const APP_ROOT_ID = 'app-root';

export function renderGoals(container) {
    const goals = db.getData('goals') || [];
    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Metas</h1>
            </div>
            <button id="add-goal-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Nova Meta</span>
            </button>
        </header>
        <section id="goals-list" class="space-y-3">
            ${goals.length > 0 ? goals.map(renderGoalItem).join('') : renderEmptyState()}
        </section>
    `;
    if (window.lucide) {
        window.lucide.createIcons();
    }
    document.getElementById('add-goal-btn').addEventListener('click', () => handleGoalModal());
    document.getElementById('goals-list').addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-goal-btn');
        if (editBtn) handleGoalModal(editBtn.dataset.id);
        const deleteBtn = e.target.closest('.delete-goal-btn');
        if (deleteBtn) handleDeleteGoal(deleteBtn.dataset.id);
    });
}

function renderGoalItem(goal) {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const deadlineText = goal.deadline ? formatDate(goal.deadline) : 'Não definido';

    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-lg">${goal.name}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Prazo: ${deadlineText}</p>
                </div>
                 <div class="flex gap-2">
                    <button class="edit-goal-btn p-1 text-slate-500 hover:text-indigo-500" data-id="${goal.id}"><i data-lucide="pencil" class="w-5 h-5 pointer-events-none"></i></button>
                    <button class="delete-goal-btn p-1 text-slate-500 hover:text-red-500" data-id="${goal.id}"><i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i></button>
                </div>
            </div>
            <div class="mt-3">
                <div class="flex justify-between text-sm font-semibold mb-1">
                    <span>${formatCurrency(goal.currentAmount)}</span>
                    <span class="text-slate-500">${formatCurrency(goal.targetAmount)}</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div class="bg-indigo-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
                 <p class="text-right text-xs mt-1 font-semibold">${progress.toFixed(1)}%</p>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-12">
        <i data-lucide="target" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i>
        <h3 class="text-xl font-semibold">Nenhuma Meta Definida</h3>
        <p class="text-slate-500">Crie metas para alcançar seus objetivos financeiros.</p>
    </div>`;
}

async function handleGoalModal(goalId = null) {
    const isEditing = goalId !== null;
    const goal = isEditing ? db.getData('goals').find(g => g.id === goalId) : null;
    const title = isEditing ? 'Editar Meta' : 'Nova Meta';
    const contentHTML = `
        <form id="goal-form" class="space-y-4">
            <div><label for="goal-name" class="form-label">Nome da Meta</label><input type="text" id="goal-name" name="goal-name" required placeholder="Ex: Viagem de Férias" value="${goal?.name || ''}" class="mt-1 w-full input-style"></div>
            <div><label for="goal-target" class="form-label">Valor Alvo</label><input type="number" step="0.01" id="goal-target" name="goal-target" required value="${goal?.targetAmount || ''}" class="mt-1 w-full input-style"></div>
            <div><label for="goal-current" class="form-label">Valor Atual</label><input type="number" step="0.01" id="goal-current" name="goal-current" required value="${goal?.currentAmount || '0'}" class="mt-1 w-full input-style"></div>
            <div><label for="goal-deadline" class="form-label">Prazo Final</label><input type="date" id="goal-deadline" name="goal-deadline" value="${goal?.deadline || ''}" class="mt-1 w-full input-style"></div>
        </form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="goal-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('#goal-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('goal-name'),
            targetAmount: parseFloat(formData.get('goal-target')),
            currentAmount: parseFloat(formData.get('goal-current')),
            deadline: formData.get('goal-deadline')
        };
        if (isEditing) {
            db.updateItem('goals', goalId, data);
            ui.showToast('Meta atualizada!', 'success');
        } else {
            data.id = generateId();
            db.addItem('goals', data);
            ui.showToast('Meta criada!', 'success');
        }
        modal.querySelector('.close-modal-btn').click();
        renderGoals(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDeleteGoal(goalId) {
    const modal = await ui.createModal("Confirmar Exclusão", "<p>Tem certeza que deseja excluir esta meta?</p>", `<div class="flex gap-2"><button class="cancel-btn w-full bg-slate-200 py-2 rounded-lg">Cancelar</button><button class="confirm-delete-btn w-full bg-red-600 text-white py-2 rounded-lg">Excluir</button></div>`);
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.deleteItem('goals', goalId);
        ui.showToast('Meta excluída.', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderGoals(document.getElementById(APP_ROOT_ID));
    };
    modal.querySelector('.cancel-btn').onclick = () => modal.querySelector('.close-modal-btn').click();
}