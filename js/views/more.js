// js/views/more.js

export function renderMore(container) {
    const menuItems = [
        { href: '#accounts', icon: 'credit-card', label: 'Contas' },
        { href: '#schedules', icon: 'calendar-clock', label: 'Agendamentos' },
        { href: '#installments', icon: 'calendar-plus', label: 'Parcelamentos' },
        { href: '#shopping-list', icon: 'shopping-cart', label: 'Listas de Compras' },
        { href: '#benefits', icon: 'gift', label: 'Benefícios' },
        { href: '#goals', icon: 'target', label: 'Metas' },
        { href: '#projections', icon: 'line-chart', label: 'Projeções' },
        { href: '#assistant', icon: 'brain-circuit', label: 'Assistente Financeiro' },
        { href: '#settings', icon: 'settings', label: 'Ajustes' },
        { href: '#features', icon: 'info', label: 'Sobre a Aplicação' }
    ];

    container.innerHTML = `
        <header class="mb-6">
            <h1 class="text-2xl font-bold">Mais Opções</h1>
            <p class="text-slate-500 dark:text-slate-400">Gerencie sua vida financeira.</p>
        </header>

        <nav>
            <ul class="space-y-2">
                ${menuItems.map(item => `
                    <li>
                        <a href="${item.href}" class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <i data-lucide="${item.icon}" class="w-6 h-6 text-indigo-500"></i>
                            <span class="font-semibold text-lg">${item.label}</span>
                            <i data-lucide="chevron-right" class="w-5 h-5 ml-auto text-slate-400"></i>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </nav>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}