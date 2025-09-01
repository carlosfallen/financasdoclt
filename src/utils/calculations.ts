// src/utils/calculations.ts

import { INSS_RATES, IRRF_RATES, DEPENDENT_DEDUCTION } from './constants';
import { Account, Schedule, Benefit, Installment, FinancialInsight, AppData } from '../types';

// Estima o saldo após o próximo pagamento
export const calculatePostPaycheckBalance = (appData: AppData): number => {
  if (!appData.user) return 0;

  const { user, accounts, benefits, schedules, installments } = appData;

  const currentBalance = calculateCurrentTotalBalance(accounts);
  const monthlySurplus = calculateMonthlySurplus(user.salary, benefits, schedules, installments);

  return currentBalance + monthlySurplus;
};

// Gera um "score financeiro" simples
export const calculateFinancialScore = (appData: AppData): number => {
  if (!appData.user) return 0;

  const { accounts, schedules, installments } = appData;

  const totalBalance = calculateCurrentTotalBalance(accounts);
  const monthlyExpenses = calculateMonthlyExpenses(schedules, installments);

  // Exemplo de cálculo básico (0 a 1000)
  let score = 500;

  if (monthlyExpenses > 0) {
    const monthsCovered = totalBalance / monthlyExpenses;
    score += monthsCovered * 50; // cada mês de reserva aumenta o score
  }

  // Limita entre 0 e 1000
  return Math.min(1000, Math.max(0, Math.round(score)));
};


export const calculateINSS = (grossSalary: number): number => {
  let inss = 0;
  
  for (const rate of INSS_RATES) {
    if (grossSalary > rate.min) {
      const taxableAmount = Math.min(grossSalary, rate.max) - rate.min;
      inss += taxableAmount * rate.rate;
    }
  }
  
  return Math.round(inss * 100) / 100;
};

export const calculateIRRF = (grossSalary: number, dependents: number = 0): number => {
  const inss = calculateINSS(grossSalary);
  const taxableIncome = grossSalary - inss - (dependents * DEPENDENT_DEDUCTION);
  
  if (taxableIncome <= 0) return 0;
  
  for (const rate of IRRF_RATES) {
    if (taxableIncome >= rate.min && taxableIncome <= rate.max) {
      const irrf = (taxableIncome * rate.rate) - rate.deduction;
      return Math.max(0, Math.round(irrf * 100) / 100);
    }
  }
  
  return 0;
};

export const calculateNetSalary = (grossSalary: number, dependents: number = 0): number => {
  const inss = calculateINSS(grossSalary);
  const irrf = calculateIRRF(grossSalary, dependents);
  return grossSalary - inss - irrf;
};

export const calculateNet13thSalary = (grossSalary: number, dependents: number = 0): number => {
  // 13º salário tem desconto apenas do INSS na primeira parcela
  // e INSS + IRRF na segunda parcela
  const inss = calculateINSS(grossSalary);
  const irrf = calculateIRRF(grossSalary, dependents);
  return grossSalary - inss - irrf;
};

export const calculateVacation = (
  grossSalary: number, 
  vacationDays: number = 30, 
  dependents: number = 0,
  sellThird: boolean = false
): {
  grossAmount: number;
  inss: number;
  irrf: number;
  netAmount: number;
  thirdBonus: number;
} => {
  // Valor proporcional das férias
  const proportionalSalary = (grossSalary * vacationDays) / 30;
  
  // 1/3 constitucional
  const thirdBonus = proportionalSalary / 3;
  
  // Abono pecuniário (venda de 1/3 das férias)
  const saleAmount = sellThird ? proportionalSalary / 3 : 0;
  const saleThirdBonus = sellThird ? saleAmount / 3 : 0;
  
  const totalGross = proportionalSalary + thirdBonus + saleAmount + saleThirdBonus;
  
  const inss = calculateINSS(totalGross);
  const taxableIncome = totalGross - inss - (dependents * DEPENDENT_DEDUCTION);
  
  let irrf = 0;
  if (taxableIncome > 0) {
    for (const rate of IRRF_RATES) {
      if (taxableIncome >= rate.min && taxableIncome <= rate.max) {
        irrf = Math.max(0, (taxableIncome * rate.rate) - rate.deduction);
        break;
      }
    }
  }
  
  return {
    grossAmount: Math.round(totalGross * 100) / 100,
    inss: Math.round(inss * 100) / 100,
    irrf: Math.round(irrf * 100) / 100,
    netAmount: Math.round((totalGross - inss - irrf) * 100) / 100,
    thirdBonus: Math.round(thirdBonus * 100) / 100
  };
};

export const calculateCurrentTotalBalance = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => total + account.balance, 0);
};

export const calculateMonthlyIncome = (
  userSalary: number, 
  benefits: Benefit[], 
  schedules: Schedule[]
): number => {
  const netSalary = calculateNetSalary(userSalary);
  const benefitsInCash = benefits
    .filter(benefit => benefit.inCash)
    .reduce((total, benefit) => total + benefit.amount, 0);
  const incomeSchedules = schedules
    .filter(schedule => schedule.type === 'income')
    .reduce((total, schedule) => total + schedule.amount, 0);
  
  return netSalary + benefitsInCash + incomeSchedules;
};

export const calculateMonthlyExpenses = (
  schedules: Schedule[], 
  installments: Installment[]
): number => {
  const expenseSchedules = schedules
    .filter(schedule => schedule.type === 'expense')
    .reduce((total, schedule) => total + schedule.amount, 0);
  
  const currentDate = new Date();
  const activeInstallments = installments
    .filter(installment => {
      const startDate = new Date(installment.startDate + '-01');
      const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 
        + (currentDate.getMonth() - startDate.getMonth());
      return monthsDiff >= 0 && monthsDiff < installment.totalInstallments;
    })
    .reduce((total, installment) => total + installment.monthlyPayment, 0);
  
  return expenseSchedules + activeInstallments;
};

export const calculateMonthlySurplus = (
  userSalary: number,
  benefits: Benefit[],
  schedules: Schedule[],
  installments: Installment[]
): number => {
  const income = calculateMonthlyIncome(userSalary, benefits, schedules);
  const expenses = calculateMonthlyExpenses(schedules, installments);
  return income - expenses;
};

export const getFinancialHealthInsights = (appData: AppData): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  
  if (!appData.user) return insights;
  
  const { user, accounts, benefits, schedules, installments, budgets, goals } = appData;
  
  // Insight sobre reserva de emergência
  const totalBalance = calculateCurrentTotalBalance(accounts);
  const monthlyExpenses = calculateMonthlyExpenses(schedules, installments);
  const emergencyMonths = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
  
  if (emergencyMonths >= 6) {
    insights.push({
      type: 'positive',
      title: 'Reserva de Emergência Excelente!',
      message: `Parabéns! Você tem uma reserva equivalente a ${emergencyMonths.toFixed(1)} meses de gastos.`,
      priority: 10
    });
  } else if (emergencyMonths >= 3) {
    insights.push({
      type: 'warning',
      title: 'Reserva de Emergência Boa',
      message: `Você tem ${emergencyMonths.toFixed(1)} meses de reserva. Tente chegar aos 6 meses ideais.`,
      priority: 8
    });
  } else {
    insights.push({
      type: 'suggestion',
      title: 'Crie uma Reserva de Emergência',
      message: 'Recomendamos ter de 3 a 6 meses de gastos guardados para emergências.',
      priority: 9
    });
  }
  
  // Insight sobre fluxo de caixa
  const monthlySurplus = calculateMonthlySurplus(user.salary, benefits, schedules, installments);
  
  if (monthlySurplus > 0) {
    insights.push({
      type: 'positive',
      title: 'Fluxo de Caixa Positivo!',
      message: `Você tem um superávit mensal de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlySurplus)}.`,
      priority: 9
    });
  } else if (monthlySurplus < 0) {
    insights.push({
      type: 'warning',
      title: 'Atenção ao Fluxo de Caixa',
      message: `Suas despesas superam a renda em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(monthlySurplus))} mensais.`,
      priority: 10
    });
  }
  
  // Insight sobre metas
  if (goals.length > 0) {
    const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);
    const progressingGoals = goals.filter(goal => goal.currentAmount > 0 && goal.currentAmount < goal.targetAmount);
    
    if (completedGoals.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Metas Concluídas!',
        message: `Parabéns! Você concluiu ${completedGoals.length} meta(s).`,
        priority: 8
      });
    }
    
    if (progressingGoals.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Continue Focado nas suas Metas',
        message: `Você tem ${progressingGoals.length} meta(s) em progresso. Continue investindo nelas!`,
        priority: 7
      });
    }
  } else {
    insights.push({
      type: 'suggestion',
      title: 'Defina suas Metas Financeiras',
      message: 'Criar metas específicas ajuda a manter o foco e alcançar seus objetivos.',
      priority: 6
    });
  }
  
  // Insight sobre parcelamentos
  const activeInstallments = installments.filter(installment => {
    const startDate = new Date(installment.startDate + '-01');
    const currentDate = new Date();
    const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 
      + (currentDate.getMonth() - startDate.getMonth());
    return monthsDiff >= 0 && monthsDiff < installment.totalInstallments;
  });
  
  if (activeInstallments.length > 3) {
    insights.push({
      type: 'warning',
      title: 'Muitos Parcelamentos Ativos',
      message: `Você tem ${activeInstallments.length} parcelamentos ativos. Considere quitar alguns para ter mais flexibilidade financeira.`,
      priority: 7
    });
  }
  
  // Insight sobre uso de benefícios
  const benefitsNotInCash = benefits.filter(benefit => !benefit.inCash);
  if (benefitsNotInCash.length > 0) {
    insights.push({
      type: 'suggestion',
      title: 'Aproveite seus Benefícios',
      message: `Você tem ${benefitsNotInCash.length} benefício(s) que não entram como dinheiro. Use-os para economizar no orçamento!`,
      priority: 5
    });
  }
  
  return insights.sort((a, b) => b.priority - a.priority);
};