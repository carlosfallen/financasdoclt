// src/utils/constants.ts

import { CategoryOption, AccountTypeOption } from '../types';

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { value: 'moradia', label: 'Moradia', icon: 'home' },
  { value: 'alimentacao', label: 'Alimentação', icon: 'shopping-cart' },
  { value: 'transporte', label: 'Transporte', icon: 'bus' },
  { value: 'saude', label: 'Saúde', icon: 'heart-pulse' },
  { value: 'lazer', label: 'Lazer', icon: 'gamepad-2' },
  { value: 'educacao', label: 'Educação', icon: 'book-open' },
  { value: 'vestuario', label: 'Vestuário', icon: 'shirt' },
  { value: 'dividas', label: 'Dívidas e Empréstimos', icon: 'landmark' },
  { value: 'investimentos', label: 'Investimentos', icon: 'trending-up' },
  { value: 'cuidados_pessoais', label: 'Cuidados Pessoais', icon: 'gem' },
  { value: 'impostos_taxas', label: 'Impostos e Taxas', icon: 'receipt' },
  { value: 'outros', label: 'Outros', icon: 'tag' },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { value: 'salario', label: 'Salário', icon: 'briefcase' },
  { value: 'freelance', label: 'Freelance / Renda Extra', icon: 'zap' },
  { value: 'investimentos', label: 'Rendimentos de Investimentos', icon: 'bar-chart-2' },
  { value: 'outros', label: 'Outras Receitas', icon: 'tag' },
];

export const ACCOUNT_TYPES: AccountTypeOption[] = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Conta Poupança' },
  { value: 'investimento', label: 'Conta de Investimento' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'carteira', label: 'Dinheiro em Espécie' },
];

export const SHOPPING_CATEGORIES = [
  'Alimentação',
  'Limpeza',
  'Higiene',
  'Medicamentos',
  'Vestuário',
  'Eletrônicos',
  'Casa',
  'Outros'
];

// Configurações de cálculo
export const INSS_RATES = [
  { min: 0, max: 1320, rate: 0.075 },
  { min: 1320.01, max: 2571.29, rate: 0.09 },
  { min: 2571.30, max: 3856.94, rate: 0.12 },
  { min: 3856.95, max: 7507.49, rate: 0.14 }
];

export const IRRF_RATES = [
  { min: 0, max: 2112, rate: 0, deduction: 0 },
  { min: 2112.01, max: 2826.65, rate: 0.075, deduction: 158.40 },
  { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 370.40 },
  { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 651.73 },
  { min: 4664.69, max: Infinity, rate: 0.275, deduction: 884.96 }
];

export const DEPENDENT_DEDUCTION = 189.59;