// js/views/features.js

export function renderFeatures(container) {
    const features = [
        { icon: 'layout-dashboard', title: 'Dashboard Inteligente', description: 'Tenha uma visão 360º da sua saúde financeira num único ecrã. Acompanhe o seu saldo, score financeiro e próximos vencimentos de forma clara e objetiva.' },
        { icon: 'line-chart', title: 'Projeções de Futuro', description: 'Veja o seu património a crescer ano após ano. A nossa ferramenta de projeção calcula a sua poupança futura com base no seu salário e despesas recorrentes.' },
        { icon: 'piggy-bank', title: 'Controlo Total de Orçamentos', description: 'Diga adeus às surpresas no final do mês. Crie orçamentos por categoria, acompanhe os seus gastos em tempo real e mantenha as suas finanças sob controlo.' },
        { icon: 'brain-circuit', title: 'Assistente Proativo', description: 'Receba insights e dicas inteligentes para otimizar os seus gastos. A nossa análise financeira ajuda-o a identificar onde pode poupar mais.' },
        { icon: 'calendar-plus', title: 'Gestão de Dívidas Simplificada', description: 'Organize as suas despesas recorrentes (agendamentos) e compras parceladas num único lugar, garantindo que nunca se esquece de um pagamento.' },
        // CORREÇÃO: Ícone 'shield-lock' alterado para 'shield'
        { icon: 'shield', title: '100% Offline e Privado', description: 'A sua privacidade é a nossa prioridade. Todos os seus dados financeiros ficam armazenados exclusivamente no seu dispositivo, nunca na nuvem.' }
    ];

    container.innerHTML = `
        <div class="p-4">
            <header class="text-center my-8">
                <i data-lucide="wallet" class="mx-auto w-16 h-16 text-indigo-500 mb-4"></i>
                <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-100">O Assistente Financeiro Definitivo para o Trabalhador CLT.</h1>
                <p class="text-lg text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">Assuma o controlo do seu salário, 13º, benefícios e despesas como nunca antes.</p>
            </header>
            <section class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/30 text-center p-6 rounded-lg mb-12">
                <h2 class="text-2xl font-bold text-yellow-800 dark:text-yellow-200">Estamos em Fase Beta!</h2>
                <p class="text-yellow-700 dark:text-yellow-300 mt-2">Junte-se a nós, teste as funcionalidades e ajude a construir a melhor ferramenta para as suas finanças. A sua opinião é fundamental!</p>
            </section>
            <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${features.map(feature => `<div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><i data-lucide="${feature.icon}" class="w-10 h-10 text-indigo-500 mb-4"></i><h3 class="text-xl font-bold mb-2">${feature.title}</h3><p class="text-slate-600 dark:text-slate-300">${feature.description}</p></div>`).join('')}
            </section>
            <footer class="text-center mt-12 mb-8">
                <a href="#onboarding" class="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-500/30">Começar Agora (É Grátis)</a>
            </footer>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}