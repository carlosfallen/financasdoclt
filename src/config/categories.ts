import { CategoryType, AccountType } from '../types';

export const EXPENSE_CATEGORIES: CategoryType[] = [
  { value: 'moradia', label: 'Moradia', icon: 'Home' },
  { value: 'alimentacao', label: 'Alimentação', icon: 'ShoppingCart' },
  { value: 'transporte', label: 'Transporte', icon: 'Bus' },
  { value: 'saude', label: 'Saúde', icon: 'Heart' },
  { value: 'lazer', label: 'Lazer', icon: 'Gamepad2' },
  { value: 'educacao', label: 'Educação', icon: 'BookOpen' },
  { value: 'vestuario', label: 'Vestuário', icon: 'Shirt' },
  { value: 'dividas', label: 'Dívidas e Empréstimos', icon: 'Landmark' },
  { value: 'investimentos', label: 'Investimentos', icon: 'TrendingUp' },
  { value: 'cuidados_pessoais', label: 'Cuidados Pessoais', icon: 'Gem' },
  { value: 'impostos_taxas', label: 'Impostos e Taxas', icon: 'Receipt' },
  { value: 'outros', label: 'Outros', icon: 'Tag' },
];

export const INCOME_CATEGORIES: CategoryType[] = [
  { value: 'salario', label: 'Salário', icon: 'Briefcase' },
  { value: 'freelance', label: 'Freelance / Renda Extra', icon: 'Zap' },
  { value: 'investimentos', label: 'Rendimentos de Investimentos', icon: 'BarChart2' },
  { value: 'outros', label: 'Outras Receitas', icon: 'Tag' },
];

export const ACCOUNT_TYPES: AccountType[] = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Conta Poupança' },
  { value: 'investimento', label: 'Conta de Investimento' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'carteira', label: 'Dinheiro em Espécie' },
];