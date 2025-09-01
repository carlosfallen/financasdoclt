// js/views/assistant.js

import * as db from '../modules/db.js';
import * as config from '../config.js';
import { getFinancialHealthInsights } from '../modules/calc.js';

export function renderAssistant(container) {
    try {
        container.innerHTML = `
            <header class="flex items-center gap-3 mb-6">
                <a href="#more" class="text-indigo-500"><i data-lucide="arrow-left"></i></a>
                <h1 class="text-2xl font-bold">Assistente Financeiro</h1>
            </header>

            <section id="assistant-chat-container" class="space-y-4 pb-24">
                <div class="chat-bubble assistant">
                    <p>Olá! Estou pronto para fazer uma análise completa da sua saúde financeira. Quando quiser, clique no botão abaixo para começar.</p>
                </div>
                
                <div id="insights-container" class="space-y-4"></div>
            </section>

            <footer class="fixed bottom-16 left-0 right-0 max-w-lg mx-auto p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
                <button id="run-analysis-btn" class="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <i data-lucide="brain-circuit" class="w-5 h-5"></i>
                    <span>Analisar Minhas Finanças</span>
                </button>
            </footer>

            <style>
                .chat-bubble { padding: 0.75rem 1rem; border-radius: 1rem; max-width: 85%; }
                .assistant { background-color: #eef2ff; color: #3730a3; border-top-left-radius: 0; }
                .dark .assistant { background-color: #3730a3; color: #e0e7ff; }
                .insight-card { opacity: 0; transform: translateY(20px); animation: fadeIn 0.5s forwards; }
            </style>
        `;

        if(window.lucide) {
            window.lucide.createIcons();
        }

        document.getElementById('run-analysis-btn').addEventListener('click', runAnalysis);
    } catch (error) {
        console.error('[ASSISTANT] Erro Crítico na Renderização:', error);
    }
}

function runAnalysis() {
    const insightsContainer = document.getElementById('insights-container');
    const runBtn = document.getElementById('run-analysis-btn');
    insightsContainer.innerHTML = '';
    
    runBtn.disabled = true;
    runBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Analisando...</span>`;

    setTimeout(() => {
        try {
            const dbData = { user: db.getData('user'), accounts: db.getData('accounts') || [], schedules: db.getData('schedules') || [], benefits: db.getData('benefits') || [], goals: db.getData('goals') || [], installments: db.getData('installments') || [], transactions: db.getData('transactions') || [], budgets: db.getData('budgets') || [], config };
            const insights = getFinancialHealthInsights(dbData);
            insights.sort((a, b) => b.priority - a.priority);

            if (insights.length > 0) {
                insights.forEach((insight, index) => {
                    setTimeout(() => {
                        insightsContainer.innerHTML += renderInsightCard(insight);
                        if(window.lucide) window.lucide.createIcons();
                        const lastCard = insightsContainer.lastChild;
                        if(lastCard && typeof lastCard.scrollIntoView === 'function') {
                            lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        }
                    }, index * 1200);
                });
            }

            setTimeout(() => {
                runBtn.disabled = false;
                runBtn.innerHTML = `<i data-lucide="brain-circuit" class="w-5 h-5"></i><span>Analisar Novamente</span>`;
                if(window.lucide) window.lucide.createIcons();
            }, (insights.length || 1) * 1200);
            
        } catch (error) {
            console.error('[ASSISTANT] Erro Crítico durante a Análise:', error);
            insightsContainer.innerHTML = `<div class="chat-bubble assistant" style="background-color: #fecaca; color: #991b1b;"><p>Ocorreu um erro ao processar seus dados. Por favor, verifique a consola para detalhes técnicos.</p></div>`;
            runBtn.disabled = false;
            runBtn.innerHTML = `<i data-lucide="brain-circuit" class="w-5 h-5"></i><span>Tentar Novamente</span>`;
            if(window.lucide) window.lucide.createIcons();
        }
    }, 1000);
}

function renderInsightCard(insight) {
    const colors = { positive: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200', warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200', suggestion: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200', };
    const icons = { positive: 'trending-up', warning: 'alert-triangle', suggestion: 'lightbulb', };
    return `<div class="insight-card border-l-4 p-4 rounded-r-lg ${colors[insight.type]}"><div class="flex items-center gap-3"><i data-lucide="${icons[insight.type]}" class="w-6 h-6"></i><h3 class="font-bold">${insight.title}</h3></div><p class="text-sm mt-2 pl-9">${insight.message}</p></div>`;
}