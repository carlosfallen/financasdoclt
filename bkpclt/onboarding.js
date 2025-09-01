// js/views/onboarding.js

import * as db from '../modules/db.js';

export function renderOnboarding(container) {
    container.innerHTML = `
        <div class="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
            <header class="mb-8">
                <i data-lucide="wallet" class="mx-auto w-16 h-16 text-indigo-500 mb-4"></i>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Bem-vindo(a)!</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2">Vamos começar com algumas informações básicas.</p>
            </header>

            <form id="onboarding-form" class="w-full max-w-sm space-y-4">
                <div>
                    <input type="text" id="user-name" name="user-name" required placeholder="Seu Nome" class="input-style">
                </div>
                <div>
                    <div class="relative">
                        <span class="absolute-icon">R$</span>
                        <input type="number" id="user-salary" name="user-salary" step="0.01" min="0" required placeholder="Salário Bruto Mensal" class="input-style pl-10">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-left mb-1 text-slate-600 dark:text-slate-300">Data de Pagamento</label>
                    <select id="payment-type" name="payment-type" class="input-style mb-2">
                        <option value="fixed">Dia Fixo do Mês</option>
                        <option value="business">Dia Útil do Mês</option>
                    </select>
                    <input type="number" id="payment-day" name="payment-day" min="1" max="31" required placeholder="Ex: 5" class="input-style">
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                    Salvar e Começar
                </button>
            </form>
            <p id="onboarding-error" class="text-red-500 mt-4 h-4"></p>
            <div class="mt-8">
                <a href="#features" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    Descubra tudo o que podemos fazer por si &rarr;
                </a>
            </div>
        </div>
        <style>
            .input-style { all: unset; box-sizing: border-box; width: 100%; display: block; padding: 12px 16px; border-radius: 0.5rem; background-color: white; border: 1px solid #cbd5e1; }
            .dark .input-style { background-color: #1e293b; border-color: #475569; }
            .absolute-icon { position: absolute; top: 0; bottom: 0; left: 0; display: flex; align-items: center; padding-left: 0.75rem; color: #94a3b8; }
        </style>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const form = document.getElementById('onboarding-form');
    form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(event) {
    event.preventDefault();
    const errorEl = document.getElementById('onboarding-error');
    errorEl.textContent = '';
    
    const formData = new FormData(event.target);
    const name = formData.get('user-name').trim();
    const salary = parseFloat(formData.get('user-salary'));
    const paymentType = formData.get('payment-type');
    const paymentDay = parseInt(formData.get('payment-day'));

    if (!name || isNaN(salary) || salary <= 0 || !paymentType || isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
        errorEl.textContent = 'Por favor, preencha todos os campos corretamente.';
        return;
    }

    const userData = { name, salary, paymentType, paymentDay };
    db.setData('user', userData);
    window.location.hash = '#dashboard';
}