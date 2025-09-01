// js/modules/calc.js

import { EXPENSE_CATEGORIES } from "../config.js";

function getNthBusinessDay(year, month, n) {
    let businessDaysCount = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDaysCount++;
            if (businessDaysCount === n) {
                return day;
            }
        }
    }
    return daysInMonth;
}

export function calculateCurrentTotalBalance(accounts = []) {
    if (!accounts || accounts.length === 0) return 0;
    return accounts.reduce((total, account) => total + (account.balance || 0), 0);
}

export function calculatePostPaycheckBalance(data = {}) {
    const { user, accounts = [], benefits = [], schedules = [], installments = [] } = data;
    if (!user || !user.salary) {
        return 0;
    }

    const startingBalance = calculateCurrentTotalBalance(accounts);
    const salaryInflow = user.salary || 0;
    const benefitsInflow = benefits
        .filter(b => b.inCash)
        .reduce((sum, b) => sum + (b.amount || 0), 0);
    const schedulesOutflow = schedules.reduce((sum, s) => sum + (s.amount || 0), 0);
    const installmentsOutflow = installments
        .filter(i => (i.payments || []).length < i.totalInstallments)
        .reduce((sum, i) => sum + (i.monthlyPayment || 0), 0);
    
    const estimatedBalance = startingBalance + salaryInflow + benefitsInflow - schedulesOutflow - installmentsOutflow;

    return estimatedBalance;
}

export function calculateFinancialScore(data = {}) {
    const { user, accounts = [], schedules = [], goals = [] } = data;
    if (!user || !user.salary) return 0;
    const totalScheduledExpenses = schedules.reduce((sum, s) => sum + s.amount, 0);
    const currentTotalBalance = calculateCurrentTotalBalance(accounts);
    const monthlySurplusRatio = user.salary > 0 ? (user.salary - totalScheduledExpenses) / user.salary : 0;
    let surplusScore = 0;
    if (monthlySurplusRatio >= 0.3) surplusScore = 1;
    else if (monthlySurplusRatio >= 0.1) surplusScore = 0.7;
    else if (monthlySurplusRatio >= 0) surplusScore = 0.4;
    const emergencyFundRatio = totalScheduledExpenses > 0 ? currentTotalBalance / totalScheduledExpenses : 10;
    let emergencyScore = 0;
    if (emergencyFundRatio >= 6) emergencyScore = 1;
    else if (emergencyFundRatio >= 3) emergencyScore = 0.8;
    else if (emergencyFundRatio >= 1) emergencyScore = 0.5;
    else if (emergencyFundRatio > 0) emergencyScore = 0.2;
    const goalsScore = (goals && goals.length > 0) ? 1 : 0.2;
    const finalScore = (surplusScore * 0.4 + emergencyScore * 0.3 + goalsScore * 0.3) * 1000;
    return Math.max(0, Math.round(finalScore));
}

export function calculateNet13thSalary(grossSalary, dependents = 0, monthsWorked = 12) {
    if (!grossSalary || grossSalary <= 0) return 0;
    const proportionalGross13th = (grossSalary / 12) * monthsWorked;
    const inssBrackets = [{ limit: 1556.94, rate: 0.075, fixed: 0 }, { limit: 2826.65, rate: 0.09, fixed: 18.18 }, { limit: 4250.00, rate: 0.12, fixed: 86.94 }, { limit: 7850.45, rate: 0.14, fixed: 171.44 }];
    let inssDeduction = 0;
    if (proportionalGross13th <= inssBrackets[0].limit) {
        inssDeduction = proportionalGross13th * inssBrackets[0].rate;
    } else if (proportionalGross13th <= inssBrackets[1].limit) {
        inssDeduction = (proportionalGross13th * inssBrackets[1].rate) - inssBrackets[1].fixed;
    } else if (proportionalGross13th <= inssBrackets[2].limit) {
        inssDeduction = (proportionalGross13th * inssBrackets[2].rate) - inssBrackets[2].fixed;
    } else {
        const inssCeilingDeduction = (inssBrackets[3].limit * inssBrackets[3].rate) - inssBrackets[3].fixed;
        inssDeduction = inssCeilingDeduction;
    }
    const dependentDeductionValue = 189.59;
    const irrfBase = proportionalGross13th - inssDeduction - (dependents * dependentDeductionValue);
    const irrfBrackets = [{ limit: 2112.00, rate: 0, fixed: 0 }, { limit: 2826.65, rate: 0.075, fixed: 158.40 }, { limit: 3751.05, rate: 0.15, fixed: 370.40 }, { limit: 4664.68, rate: 0.225, fixed: 662.77 }, { limit: Infinity, rate: 0.275, fixed: 896.00 }];
    let irrfDeduction = 0;
    for (const bracket of irrfBrackets) {
        if (irrfBase <= bracket.limit) {
            irrfDeduction = (irrfBase * bracket.rate) - bracket.fixed;
            break;
        }
    }
    irrfDeduction = Math.max(0, irrfDeduction);
    const net13th = proportionalGross13th - inssDeduction - irrfDeduction;
    return net13th;
}

export function getFinancialHealthInsights(data = {}) {
    const { user, accounts = [], transactions = [], budgets = [], schedules = [], goals = [] } = data;
    const insights = [];
    const today = new Date();
    const currentMonthISO = today.toISOString().slice(0, 7);
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthProgress = dayOfMonth / daysInMonth;

    const monthlyExpenses = transactions.filter(t => t.date.startsWith(currentMonthISO) && t.type === 'expense');
    const monthlyBudgets = budgets.filter(b => b.month === currentMonthISO);
    const totalMonthlyFixedExpenses = schedules.reduce((sum, s) => sum + s.amount, 0);
    const currentTotalBalance = calculateCurrentTotalBalance(accounts);

    if (monthlyBudgets.length === 0) {
        insights.push({ type: 'suggestion', title: 'Orçamentos não Definidos', message: 'Definir orçamentos mensais é o primeiro passo para controlar os seus gastos. Que tal criar alguns agora na tela de Orçamentos?', priority: 10 });
    } else {
        for (const budget of monthlyBudgets) {
            const spentInCategory = monthlyExpenses.filter(t => t.category === budget.category).reduce((sum, t) => sum + t.amount, 0);
            if (budget.amount > 0) {
                const spendingProgress = spentInCategory / budget.amount;
                const categoryLabel = EXPENSE_CATEGORIES.find(c => c.value === budget.category)?.label || 'uma categoria';
                if (spendingProgress >= 1) {
                    insights.push({ type: 'warning', title: 'Orçamento Excedido', message: `Atenção! Você já ultrapassou o seu orçamento para ${categoryLabel} este mês. É importante reavaliar.`, priority: 9 });
                } else if (spendingProgress > monthProgress + 0.20) {
                    insights.push({ type: 'warning', title: 'Gasto Acelerado', message: `Cuidado, os seus gastos com ${categoryLabel} estão a avançar mais rápido do que o mês. Tente reduzir o ritmo.`, priority: 8 });
                }
            }
        }
    }

    const debtToIncomeRatio = user.salary > 0 ? totalMonthlyFixedExpenses / user.salary : 0;
    if (debtToIncomeRatio > 0.5) {
        insights.push({ type: 'warning', title: 'Endividamento Elevado', message: `Mais de 50% do seu salário está comprometido com despesas fixas. Isto pode limitar a sua capacidade de poupar e investir.`, priority: 7 });
    }

    const emergencyFundRatio = totalMonthlyFixedExpenses > 0 ? currentTotalBalance / totalMonthlyFixedExpenses : 10;
    if (emergencyFundRatio < 1) {
        insights.push({ type: 'suggestion', title: 'Reserva de Emergência', message: 'A sua reserva de emergência parece baixa. Idealmente, deveria ter o suficiente para cobrir 1 mês de despesas fixas.', priority: 6 });
    } else if (emergencyFundRatio >= 3 && emergencyFundRatio < 6) {
        insights.push({ type: 'positive', title: 'Boa Reserva de Emergência', message: `Parabéns! Você tem o equivalente a ${Math.floor(emergencyFundRatio)} meses de despesas guardado. Continue a aumentar até chegar aos 6 meses.`, priority: 5 });
    }

    if (goals.length === 0) {
        insights.push({ type: 'suggestion', title: 'Poupe com um Objetivo', message: 'Definir metas financeiras, como uma viagem ou a entrada de um imóvel, pode aumentar muito a sua motivação para poupar.', priority: 4 });
    } else {
        const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
        if(completedGoals > 0) {
            insights.push({ type: 'positive', title: 'Meta Atingida!', message: `Parabéns por ter atingido ${completedGoals} das suas metas! Continue com o excelente trabalho.`, priority: 3 });
        }
    }

    const nonEssentialCategories = ['lazer', 'cuidados_pessoais', 'vestuario'];
    let nonEssentialSpending = 0;
    let totalSpending = 0;
    monthlyExpenses.forEach(t => {
        if (nonEssentialCategories.includes(t.category)) {
            nonEssentialSpending += t.amount;
        }
        totalSpending += t.amount;
    });
    if (totalSpending > 0 && (nonEssentialSpending / totalSpending) > 0.4) {
        insights.push({ type: 'suggestion', title: 'Equilíbrio de Gastos', message: "Uma parte considerável das suas despesas este mês foi com itens não essenciais. Verifique se isto está alinhado com as suas metas de poupança.", priority: 2 });
    }

    if (insights.length === 0) {
        insights.push({ type: 'positive', title: 'Finanças em Ordem', message: 'Análise concluída: as suas finanças parecem estar saudáveis e sob controlo este mês. Continue com o bom trabalho!', priority: 1 });
    }

    return insights;
}