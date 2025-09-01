// js/views/settings.js

import * as db from '../modules/db.js';
import * as ui from '../modules/ui.js';

export function renderSettings(container) {
    container.innerHTML = `
        <header class="flex items-center gap-3 mb-6">
            <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
            <h1 class="text-2xl font-bold">Ajustes</h1>
        </header>

        <section class="space-y-4">
            <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                <h2 class="font-bold text-lg">Gerenciamento de Dados</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Faça backup ou restaure seus dados. Os seus dados nunca saem do seu dispositivo.</p>
                <div class="flex flex-col sm:flex-row gap-2">
                    <button id="export-data-btn" class="btn-primary flex-1">
                        <i data-lucide="download"></i> Exportar Dados
                    </button>
                    <button id="import-data-btn" class="btn-secondary flex-1">
                        <i data-lucide="upload"></i> Importar Dados
                    </button>
                </div>
            </div>
            
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-4 rounded-lg">
                 <h2 class="font-bold text-lg text-red-800 dark:text-red-300">Área de Risco</h2>
                 <p class="text-sm text-red-600 dark:text-red-400 mb-4">Esta ação apagará todos os dados permanentemente.</p>
                 <button id="reset-app-btn" class="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                    Resetar Aplicação
                </button>
            </div>
        </section>
        <style>
            .btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #4f46e5; color: white; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; }
            .btn-secondary { display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #e2e8f0; color: #1e293b; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; }
            .dark .btn-secondary { background-color: #475569; color: #e2e8f0; }
        </style>
    `;
    if (window.lucide) {
        window.lucide.createIcons();
    }

    document.getElementById('export-data-btn').addEventListener('click', handleExport);
    document.getElementById('import-data-btn').addEventListener('click', handleImport);
    document.getElementById('reset-app-btn').addEventListener('click', handleReset);
}

function handleExport() {
    const data = localStorage.getItem('CLT_FINANCEIRO_DATA');
    if (!data || data === "null") {
        ui.showToast('Nenhum dado para exportar.', 'info');
        return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clt-financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ui.showToast('Download do backup iniciado!', 'success');
}

function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const dataToImport = JSON.parse(event.target.result);
                if (dataToImport && typeof dataToImport === 'object' && 'user' in dataToImport && 'accounts' in dataToImport) {
                    
                    localStorage.setItem('CLT_FINANCEIRO_DATA', JSON.stringify(dataToImport));
                    
                    ui.showToast('Dados importados! A página será recarregada.', 'success');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    throw new Error('Arquivo JSON inválido ou não corresponde ao formato esperado.');
                }
            } catch (error) {
                console.error("Erro ao importar:", error);
                ui.showToast('Erro ao importar: arquivo inválido.', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

async function handleReset() {
    const modal = await ui.createModal("Confirmar Reset", "<p class='text-lg'>Isto apagará <strong class='font-bold'>TODOS</strong> os seus dados permanentemente. Tem certeza absoluta que deseja continuar?</p>", `<div class="flex gap-2"><button class="cancel-btn w-full bg-slate-200 py-2 rounded-lg">Não, cancelar</button><button class="confirm-delete-btn w-full bg-red-600 text-white py-2 rounded-lg">Sim, apagar tudo</button></div>`);
    modal.querySelector('.confirm-delete-btn').onclick = () => {
        db.resetDatabase();
    };
    modal.querySelector('.cancel-btn').onclick = () => modal.querySelector('.close-modal-btn').click();
}