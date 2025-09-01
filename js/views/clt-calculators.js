// js/views/clt-calculators.js

// As funções de cálculo virão do módulo calc.js
// import { calculateVacation, calculate13th, calculateTermination } from '../modules/calc.js';

/**
 * Renderiza a tela das Calculadoras CLT.
 * @param {HTMLElement} container - O elemento onde a view será renderizada.
 */
export function renderCltCalculators(container) {
    container.innerHTML = `
        <header class="flex items-center gap-3 mb-6">
            <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
            <h1 class="text-2xl font-bold">Calculadoras CLT</h1>
        </header>

        <section>
            <!-- Abas de Navegação -->
            <div class="border-b border-slate-200 dark:border-slate-700 mb-4">
                <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                    <button class="tab-btn active" data-tab="vacation">Férias</button>
                    <button class="tab-btn" data-tab="thirteenth">13º Salário</button>
                    <button class="tab-btn" data-tab="termination">Rescisão</button>
                </nav>
                <style>
                    .tab-btn { all: unset; cursor: pointer; padding: 1rem; border-bottom: 2px solid transparent; }
                    .tab-btn.active { border-color: #4f46e5; color: #4f46e5; font-weight: 600; }
                </style>
            </div>

            <!-- Conteúdo das Abas -->
            <div id="calculator-content">
                <!-- O conteúdo da aba ativa será renderizado aqui -->
            </div>
        </section>
    `;
    if (window.lucide) window.lucide.createIcons();

    const tabs = container.querySelectorAll('.tab-btn');
    const contentContainer = container.querySelector('#calculator-content');

    function switchTab(tabId) {
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        switch (tabId) {
            case 'vacation':
                contentContainer.innerHTML = renderVacationCalculator();
                break;
            case 'thirteenth':
                contentContainer.innerHTML = '<!-- Conteúdo da Calculadora de 13º Salário aqui -->';
                break;
            case 'termination':
                 contentContainer.innerHTML = '<!-- Conteúdo da Calculadora de Rescisão aqui -->';
                break;
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Inicia na primeira aba
    switchTab('vacation');
}

/**
 * Renderiza o HTML para a calculadora de Férias.
 * @returns {string} HTML do formulário e área de resultado.
 */
function renderVacationCalculator() {
    return `
        <div class="space-y-4 p-1">
             <h2 class="text-xl font-semibold">Cálculo de Férias</h2>
             <form id="vacation-form" class="space-y-4">
                 <div>
                     <label for="vac-salary" class="label-style">Salário Bruto</label>
                     <input type="number" id="vac-salary" class="input-style" placeholder="3000.00" required>
                 </div>
                 <div>
                     <label for="vac-days" class="label-style">Dias de Férias</label>
                     <input type="number" id="vac-days" class="input-style" placeholder="30" required min="1" max="30">
                 </div>
                 <div>
                     <label for="vac-dependents" class="label-style">Número de Dependentes (IRRF)</label>
                     <input type="number" id="vac-dependents" class="input-style" placeholder="0" required min="0">
                 </div>
                 <div class="flex items-center gap-2">
                    <input type="checkbox" id="vac-sell" class="h-4 w-4 rounded border-gray-300 text-indigo-600">
                    <label for="vac-sell">Vender 1/3 das férias (abono pecuniário)?</label>
                 </div>
                 <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg">Calcular</button>
             </form>
             <div id="vacation-results" class="hidden mt-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg"></div>
             <style>
                .label-style { display: block; margin-bottom: 4px; font-weight: 500; }
                .input-style { all: unset; box-sizing: border-box; width: 100%; display: block; padding: 10px 12px; border-radius: 0.5rem; background-color: #f1f5f9; border: 1px solid #cbd5e1; } .dark .input-style { background-color: #334155; border-color: #475569; }
             </style>
        </div>
    `;
    // TODO: Adicionar event listener para o submit do formulário
}