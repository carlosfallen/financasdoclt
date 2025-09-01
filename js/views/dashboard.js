// js/views/dashboard.js

import * as db from '../modules/db.js';
import * as config from '../config.js';
import { formatCurrency } from '../modules/utils.js';
import { calculateCurrentTotalBalance, calculatePostPaycheckBalance, calculateFinancialScore } from '../modules/calc.js';

export function renderDashboard(container) {
    const user = db.getData('user');
    if (!user) { window.location.hash = '#onboarding'; return; }

    const dbData = { user, accounts: db.getData('accounts') || [], schedules: db.getData('schedules') || [], benefits: db.getData('benefits') || [], goals: db.getData('goals') || [], installments: db.getData('installments') || [], transactions: db.getData('transactions') || [], budgets: db.getData('budgets') || [], config };

    const currentBalance = calculateCurrentTotalBalance(dbData.accounts);
    const postPaycheckBalance = calculatePostPaycheckBalance(dbData);
    const totalMonthlyBenefits = dbData.benefits.filter(b => b.inCash).reduce((sum, b) => sum + (b.amount || 0), 0);
    const projectedBalanceWithBenefits = postPaycheckBalance + totalMonthlyBenefits;
    const financialScore = calculateFinancialScore(dbData);
    
    container.innerHTML = `
        <header class="mb-6"><h1 class="text-2xl font-bold">Olá, ${user.name.split(' ')[0]}!</h1><p class="text-slate-500 dark:text-slate-400">Aqui está seu resumo financeiro.</p></header>
        <section class="space-y-4">
            <div class="card"><div class="flex items-center justify-between"><div><h2 class="font-bold text-lg">Score Financeiro</h2><p class="text-3xl font-bold text-indigo-500">${financialScore}</p></div><div class="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50"><span class="text-2xl font-bold text-indigo-500">${Math.round((financialScore/1000)*100)}%</span></div></div></div>
            
            <div id="features-carousel" class="relative w-full rounded-lg shadow overflow-hidden">
                <div id="carousel-track" class="flex transition-transform duration-500 ease-in-out"></div>
                <div id="carousel-dots" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="card"><h3 class="card-title">Saldo Atual em Contas</h3><p class="card-value">${formatCurrency(currentBalance)}</p></div>
                <div class="card"><h3 class="card-title">Saldo no Próximo Pagamento <span class="text-xs">(est.)</span></h3><p class="card-value">${formatCurrency(postPaycheckBalance)}</p></div>
            </div>

            <div class="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
                <h3 class="card-title text-green-800 dark:text-green-200">Saldo Projetado + Benefícios</h3><p class="card-value text-green-600 dark:text-green-400">${formatCurrency(projectedBalanceWithBenefits)}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Uma estimativa do seu poder de compra total no próximo ciclo.</p>
            </div>

            <div class="card"><h3 class="font-bold text-lg mb-2">Próximos Vencimentos</h3><ul id="upcoming-schedules-list" class="space-y-2">${renderUpcomingPayments(dbData)}</ul></div>
        </section>
        <style>.card{background-color:#f8fafc;padding:1rem;border-radius:.5rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05)}.dark .card{background-color:rgba(30,41,59,.5)}.card-title{font-weight:600;color:#64748b}.dark .card-title{color:#94a3b8}.card-value{font-size:1.5rem;line-height:2rem;font-weight:700}.carousel-slide{flex-shrink:0;width:100%}.carousel-dot{width:8px;height:8px;border-radius:50%;background-color:rgba(255,255,255,.5);cursor:pointer;transition:background-color .3s}.carousel-dot.active{background-color:#fff}</style>
    `;

    if (window.lucide) { window.lucide.createIcons(); }
    initCarousel();
}

function initCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    const carousel = document.getElementById('features-carousel');
    if (!track || !dotsContainer || !carousel) return;

    const slidesContent = [
        { icon: 'brain-circuit', title: 'Novo Assistente Financeiro', text: 'Receba dicas e análises detalhadas sobre as suas finanças na nova secção do menu.', buttonText: 'Analisar Agora', link: '#assistant', color: 'bg-indigo-500' },
        { icon: 'line-chart', title: 'Planeie o Seu Futuro', text: 'Já viu a nossa ferramenta de Projeções? Simule o crescimento do seu património.', buttonText: 'Ver Projeções', link: '#projections', color: 'bg-green-500' },
        // CORREÇÃO: Ícone 'shield-lock' alterado para 'shield'
        { icon: 'shield', title: 'A Sua Privacidade é Total', text: 'Lembre-se: todos os seus dados ficam guardados apenas no seu dispositivo.', buttonText: null, link: null, color: 'bg-slate-600' },
        { icon: 'target', title: 'Alcance os Seus Sonhos', text: 'Defina metas financeiras e acompanhe o seu progresso para se manter motivado.', buttonText: 'Definir Metas', link: '#goals', color: 'bg-orange-500' }
    ];

    track.innerHTML = ''; // Limpa o conteúdo antes de adicionar
    dotsContainer.innerHTML = '';

    slidesContent.forEach((slide, index) => {
        track.innerHTML += `<div class="carousel-slide ${slide.color} text-white p-6 h-48 flex flex-col justify-between"><div><div class="flex items-center gap-2 mb-2"><i data-lucide="${slide.icon}" class="w-6 h-6"></i><h3 class="font-bold text-lg">${slide.title}</h3></div><p class="text-sm">${slide.text}</p></div>${slide.buttonText ? `<a href="${slide.link}" class="bg-white/30 hover:bg-white/50 text-white font-bold py-2 px-4 rounded-lg text-sm self-start">${slide.buttonText}</a>` : ''}</div>`;
        dotsContainer.innerHTML += `<div class="carousel-dot" data-index="${index}"></div>`;
    });
    if (window.lucide) { window.lucide.createIcons(); }
    let currentIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let autoPlayInterval = null;
    function goToSlide(index) { if (index < 0) index = slides.length - 1; if (index >= slides.length) index = 0; track.style.transform = `translateX(-${index * 100}%)`; dots.forEach(dot => dot.classList.remove('active')); if(dots[index]) dots[index].classList.add('active'); currentIndex = index; }
    function startAutoPlay() { stopAutoPlay(); autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 7000); }
    function stopAutoPlay() { clearInterval(autoPlayInterval); }
    dots.forEach(dot => { dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index))); });
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('touchstart', stopAutoPlay, { passive: true });
    carousel.addEventListener('touchend', startAutoPlay);
    goToSlide(0);
    startAutoPlay();
}

function renderUpcomingPayments(dbData) {
    const { schedules, installments } = dbData;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const upcomingPayments = [];
    const currentMonth = today.toISOString().slice(0, 7);
    schedules.forEach(schedule => {
        const paidThisMonth = (schedule.payments || []).some(p => p.month === currentMonth);
        if (paidThisMonth) { return; }
        let nextDueDate = new Date(today.getFullYear(), today.getMonth(), schedule.dueDate);
        if (nextDueDate < today) { nextDueDate.setMonth(nextDueDate.getMonth() + 1); }
        if (nextDueDate <= thirtyDaysFromNow) { upcomingPayments.push({ description: schedule.description, amount: schedule.amount, date: nextDueDate, type: 'Agendamento' }); }
    });
    installments.forEach(item => {
        if ((item.payments || []).length >= item.totalInstallments) { return; }
        const paidCount = (item.payments || []).length;
        const startDate = new Date(item.startDate + '-01T00:00:00');
        const monthsSinceStart = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
        const isDueOrOverdue = monthsSinceStart >= paidCount;
        if (isDueOrOverdue) {
            const installmentDueDay = 15;
            let nextPaymentDate = new Date(startDate.getFullYear(), startDate.getMonth() + paidCount, installmentDueDay);
            if (nextPaymentDate < today) {
                nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), installmentDueDay);
                if (nextPaymentDate < today) {
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                }
            }
            if (nextPaymentDate <= thirtyDaysFromNow) {
                upcomingPayments.push({ description: `${item.description} (${paidCount + 1}/${item.totalInstallments})`, amount: item.monthlyPayment, date: nextPaymentDate, type: 'Parcela' });
            }
        }
    });
    upcomingPayments.sort((a, b) => a.date - b.date);
    if (upcomingPayments.length === 0) { return '<p class="text-sm text-slate-500 dark:text-slate-400">Nenhum vencimento pendente para os próximos 30 dias.</p>'; }
    return upcomingPayments.slice(0, 5).map(p => `<li class="flex justify-between items-center text-sm"><div><p class="font-semibold">${p.description}</p><p class="text-slate-500 dark:text-slate-400">${p.type} - Vence em ${p.date.toLocaleDateString('pt-BR')}</p></div><span class="font-bold text-red-500">${formatCurrency(p.amount)}</span></li>`).join('');
}