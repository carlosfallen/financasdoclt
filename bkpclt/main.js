// js/main.js

import { initRouter } from './modules/router.js';
import * as db from './modules/db.js';
import * as ui from './modules/ui.js';

// 1. IMPORTAÇÃO DE TODOS OS MÓDULOS DE VISUALIZAÇÃO (VIEWS)
import { renderOnboarding } from './views/onboarding.js';
import { renderDashboard } from './views/dashboard.js';
import { renderTransactions } from './views/transactions.js';
import { renderBudgets } from './views/budgets.js';
import { renderMore } from './views/more.js';
import { renderAccounts } from './views/accounts.js';
import { renderSchedules } from './views/schedules.js';
import { renderBenefits } from './views/benefits.js';
import { renderGoals } from './views/goals.js';
import { renderProjections } from './views/projections.js';
import { renderInstallments } from './views/installments.js';
import { renderSettings } from './views/settings.js';
import { renderFeatures } from './views/features.js';
import { renderAssistant } from './views/assistant.js';
import { renderShoppingLists } from './views/shopping-list.js';

// 2. FUNÇÃO PRINCIPAL: O PONTO DE ENTRADA DA APLICAÇÃO
function main() {
    // Registo de todas as rotas possíveis na aplicação
    const routes = {
        '#onboarding': renderOnboarding,
        '#dashboard': renderDashboard,
        '#transactions': renderTransactions,
        '#budgets': renderBudgets,
        '#more': renderMore,
        '#accounts': renderAccounts,
        '#schedules': renderSchedules,
        '#benefits': renderBenefits,
        '#goals': renderGoals,
        '#projections': renderProjections,
        '#installments': renderInstallments,
        '#settings': renderSettings,
        '#features': renderFeatures,
        '#assistant': renderAssistant,
        '#shopping-list': renderShoppingLists,
    };

    const appRoot = document.getElementById('app-root');
    initRouter(routes, appRoot); // Inicializa o encaminhador com as rotas
    
    // Lógica de negócio inicial para decidir a primeira página do utilizador
    const userData = db.getData('user');
    const currentHash = window.location.hash;

    if (userData && userData.salary) {
        // Se o utilizador já está configurado e na página raiz, envia para o dashboard
        if (!currentHash || currentHash === '#') {
            window.location.hash = '#dashboard';
        }
    } else {
        // Se é um novo utilizador, só pode ver as páginas públicas
        const allowedRoutesForNewUser = ['#features', '#onboarding'];
        if (!allowedRoutesForNewUser.includes(currentHash)) {
            window.location.hash = '#features'; // Página de marketing por defeito
        }
    }

    // Ativa a gestão da barra de navegação
    updateActiveNavLink();
    window.addEventListener('hashchange', updateActiveNavLink);
    
    // Ativa o botão de adição rápida
    const quickAddBtn = document.getElementById('quick-add-btn');
    quickAddBtn.addEventListener('click', async () => {
        const nav = document.getElementById('bottom-nav');
        if (nav) nav.style.display = 'none';

        const success = await ui.showTransactionModal();
        if (success) {
            const currentHashOnSuccess = window.location.hash || '#dashboard';
            const viewToRender = routes[currentHashOnSuccess];
            if (viewToRender) {
                 viewToRender(appRoot); // Re-renderiza a página atual para refletir a mudança
            }
        }
        
        if (nav) nav.style.display = 'flex';
    });
}

// 3. FUNÇÃO AUXILIAR PARA GERIR A INTERFACE DA NAVEGAÇÃO
function updateActiveNavLink() {
    const currentHash = window.location.hash || '#dashboard';
    const navLinks = document.querySelectorAll('.nav-link');
    const navBar = document.getElementById('bottom-nav');

    // Esconde a barra de navegação em páginas que não a devem ter
    if (['#features', '#onboarding'].includes(currentHash)) {
        if(navBar) navBar.style.display = 'none';
    } else {
        if(navBar) navBar.style.display = 'flex';
    }

    // Destaca o ícone da página atual
    navLinks.forEach(link => {
        if (link.dataset.route === currentHash) {
            link.classList.add('nav-link-active');
        } else {
            link.classList.remove('nav-link-active');
        }
    });
    
    // Garante que os ícones são sempre renderizados após uma mudança de página
    if (window.lucide) {
        setTimeout(() => window.lucide.createIcons(), 0);
    }
}

// Ponto de partida do JavaScript, espera que a página HTML esteja pronta
document.addEventListener('DOMContentLoaded', main);