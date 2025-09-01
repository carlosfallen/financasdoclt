// js/views/shopping-list.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';
import { formatCurrency, generateId } from '../modules/utils.js';

const APP_ROOT_ID = 'app-root';

export function renderShoppingLists(container) {
    const lists = db.getData('shoppingLists') || [];
    container.innerHTML = `
        <header class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Listas de Compras</h1>
            </div>
            <button id="add-list-btn" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2">
                <i data-lucide="plus" class="w-5 h-5"></i>
                <span>Nova Lista</span>
            </button>
        </header>
        <section id="shopping-lists-container" class="space-y-3">
            ${lists.length > 0 ? lists.map(renderListItem).join('') : renderEmptyState()}
        </section>
    `;
    if (window.lucide) { window.lucide.createIcons(); }

    document.getElementById('add-list-btn').addEventListener('click', () => handleListModal());
    document.getElementById('shopping-lists-container').addEventListener('click', (e) => {
        const detailsBtn = e.target.closest('.details-list-btn');
        if (detailsBtn) handleDetailsModal(detailsBtn.dataset.id);
        const deleteBtn = e.target.closest('.delete-list-btn');
        if (deleteBtn) handleDeleteList(deleteBtn.dataset.id);
    });
}

function renderListItem(list) {
    const items = list.items || [];
    const checkedItems = items.filter(item => item.checked).length;
    const progress = items.length > 0 ? (checkedItems / items.length) * 100 : 0;
    return `
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-lg">${list.name}</p>
                    <p class="text-sm text-slate-500">${checkedItems} de ${items.length} itens marcados</p>
                </div>
                <button class="delete-list-btn p-1 text-slate-500 hover:text-red-500" data-id="${list.id}"><i data-lucide="trash-2" class="w-5 h-5 pointer-events-none"></i></button>
            </div>
            <div class="mt-3 mb-4">
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div class="bg-indigo-500 h-2 rounded-full" style="width: ${progress}%"></div></div>
            </div>
            <div class="text-right">
                <button class="details-list-btn bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm" data-id="${list.id}">Ver Itens</button>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `<div class="text-center py-12"><i data-lucide="clipboard-list" class="w-16 h-16 mx-auto text-slate-400 mb-4"></i><h3 class="text-xl font-semibold">Nenhuma Lista Criada</h3><p class="text-slate-500">Crie sua primeira lista de compras para se organizar.</p></div>`;
}

async function handleListModal(listId = null) {
    const isEditing = listId !== null;
    const list = isEditing ? db.getData('shoppingLists').find(l => l.id === listId) : null;
    const title = isEditing ? 'Editar Lista' : 'Nova Lista de Compras';
    const contentHTML = `
        <form id="list-form"><label for="list-name" class="form-label">Nome da Lista</label><input type="text" id="list-name" name="list-name" required class="mt-1 w-full input-style" value="${list?.name || ''}" placeholder="Ex: Supermercado do Mês"></form>
        <style>.form-label{display:block;font-weight:500;font-size:.875rem;color:#475569}.dark .form-label{color:#cbd5e1}.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button type="submit" form="list-form" class="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);
    modal.querySelector('#list-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('list-name');
        if (isEditing) {
            db.updateItem('shoppingLists', listId, { name });
            ui.showToast('Lista atualizada!', 'success');
        } else {
            const newList = { id: generateId(), name, items: [] };
            db.addItem('shoppingLists', newList);
            ui.showToast('Lista criada!', 'success');
        }
        modal.querySelector('.close-modal-btn').click();
        renderShoppingLists(document.getElementById(APP_ROOT_ID));
    };
}

async function handleDetailsModal(listId) {
    const list = db.getData('shoppingLists').find(l => l.id === listId);
    if (!list) return;

    const renderItems = (items) => items.map(item => `
        <div class="flex items-center justify-between py-2 border-b dark:border-slate-700">
            <div class="flex items-center gap-3">
                <input type="checkbox" data-item-id="${item.id}" class="toggle-item-check h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" ${item.checked ? 'checked' : ''}>
                <span class="text-slate-800 dark:text-slate-100 ${item.checked ? 'line-through text-slate-400' : ''}">${item.name}</span>
            </div>
            <button class="delete-item-btn p-1 text-slate-400 hover:text-red-500" data-item-id="${item.id}"><i data-lucide="x" class="w-4 h-4 pointer-events-none"></i></button>
        </div>
    `).join('');

    const title = list.name;
    const contentHTML = `
        <div id="list-items-container" class="max-h-60 overflow-y-auto mb-4">${renderItems(list.items || [])}</div>
        <form id="add-item-form" class="flex gap-2">
            <input type="text" name="item-name" class="w-full input-style" placeholder="Novo item..." required>
            <button type="submit" class="bg-indigo-600 text-white p-2 rounded-lg flex-shrink-0"><i data-lucide="plus"></i></button>
        </form>
        <style>.input-style{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 12px;border-radius:.5rem;background-color:#f1f5f9;border:1px solid #cbd5e1}.dark .input-style{background-color:#334155;border-color:#475569}</style>
    `;
    const footerHTML = `<button class="close-modal-btn w-full bg-slate-200 dark:bg-slate-600 font-bold py-2 px-4 rounded-lg">Fechar</button>`;
    const modal = await ui.createModal(title, contentHTML, footerHTML);

    if (window.lucide) { window.lucide.createIcons(); }

    const updateUI = () => {
        const updatedList = db.getData('shoppingLists').find(l => l.id === listId);
        document.getElementById('list-items-container').innerHTML = renderItems(updatedList.items || []);
        if (window.lucide) { window.lucide.createIcons(); }
        renderShoppingLists(document.getElementById(APP_ROOT_ID)); // Atualiza a tela principal também
    };

    modal.querySelector('#add-item-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const itemName = formData.get('item-name').trim();
        if (itemName) {
            const newItem = { id: generateId(), name: itemName, checked: false };
            const updatedItems = [...(list.items || []), newItem];
            db.updateItem('shoppingLists', listId, { items: updatedItems });
            e.target.reset();
            updateUI();
        }
    };

    modal.querySelector('#list-items-container').addEventListener('click', (e) => {
        const checkbox = e.target.closest('.toggle-item-check');
        const deleteBtn = e.target.closest('.delete-item-btn');
        if (checkbox) {
            const itemId = checkbox.dataset.itemId;
            const updatedItems = list.items.map(item => item.id === itemId ? { ...item, checked: checkbox.checked } : item);
            db.updateItem('shoppingLists', listId, { items: updatedItems });
            updateUI();
        }
        if (deleteBtn) {
            const itemId = deleteBtn.dataset.itemId;
            const updatedItems = list.items.filter(item => item.id !== itemId);
            db.updateItem('shoppingLists', listId, { items: updatedItems });
            updateUI();
        }
    });
}

async function handleDeleteList(listId) {
    const modal = await ui.createModal("Confirmar Exclusão", "<p>Tem certeza que deseja excluir esta lista de compras?</p>", `<div class="flex gap-2"><button class="cancel-btn w-full bg-slate-200 py-2 rounded-lg">Cancelar</button><button class="confirm-delete-btn w-full bg-red-600 text-white py-2 rounded-lg">Excluir</button></div>`);
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.deleteItem('shoppingLists', listId);
        ui.showToast('Lista excluída.', 'success');
        modal.querySelector('.close-modal-btn').click();
        renderShoppingLists(document.getElementById(APP_ROOT_ID));
    };
    modal.querySelector('.cancel-btn').onclick = () => modal.querySelector('.close-modal-btn').click();
}