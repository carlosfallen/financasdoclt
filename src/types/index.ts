export interface User {
  id?: string;
  name: string;
  salary: number;
  paymentType: 'fixed' | 'business';
  paymentDay: number;
  email?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'carteira';
  balance: number;
  userId?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  userId?: string;
}

export interface Schedule {
  id: string;
  description: string;
  amount: number;
  dueDate: number;
  category: string;
  payments: Array<{ month: string; transactionId: string }>;
  userId?: string;
}

export interface Benefit {
  id: string;
  name: string;
  amount: number;
  receiptDay: number;
  inCash: boolean;
  userId?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
  userId?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  userId?: string;
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  monthlyPayment: number;
  startDate: string;
  category: string;
  payments: Array<{ installmentNumber: number; transactionId: string }>;
  userId?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: Array<{ id: string; name: string; checked: boolean }>;
  userId?: string;
}

export interface FinancialInsight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  message: string;
  priority: number;
}

export type CategoryType = {
  value: string;
  label: string;
  icon: string;
};

export type AccountType = {
  value: string;
  label: string;
};