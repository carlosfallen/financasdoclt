// src/types/index.ts

export interface User {
  id?: string;
  name: string;
  salary: number;
  paymentType: 'fixed' | 'business';
  paymentDay: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'cartao_credito' | 'carteira';
  balance: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
}

export interface Schedule {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  startDate: string;
  endDate?: string;
  dueDay: number;
  payments: SchedulePayment[];
}

export interface SchedulePayment {
  month: string;
  transactionId: string;
  paidAt: string;
}

export interface Benefit {
  id: string;
  name: string;
  amount: number;
  receiptDay: number;
  inCash: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  monthlyPayment: number;
  totalInstallments: number;
  startDate: string;
  category: string;
  payments: InstallmentPayment[];
}

export interface InstallmentPayment {
  installmentNumber: number;
  transactionId: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  purchased: boolean;
  category?: string;
}

export interface AppData {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  schedules: Schedule[];
  benefits: Benefit[];
  budgets: Budget[];
  goals: Goal[];
  installments: Installment[];
  shoppingLists: ShoppingList[];
}

export interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

export interface AccountTypeOption {
  value: string;
  label: string;
}

export interface FinancialInsight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  message: string;
  priority: number;
}

export interface MonthlyProjection {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}