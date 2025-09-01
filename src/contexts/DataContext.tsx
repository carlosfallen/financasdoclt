// src/contexts/DataContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, User, Account, Transaction, Schedule, Benefit, Budget, Goal, Installment, ShoppingList } from '../types';

interface DataContextType {
  data: AppData;
  updateUser: (user: User) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  addBenefit: (benefit: Benefit) => void;
  updateBenefit: (id: string, updates: Partial<Benefit>) => void;
  deleteBenefit: (id: string) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addInstallment: (installment: Installment) => void;
  updateInstallment: (id: string, updates: Partial<Installment>) => void;
  deleteInstallment: (id: string) => void;
  addShoppingList: (list: ShoppingList) => void;
  updateShoppingList: (id: string, updates: Partial<ShoppingList>) => void;
  deleteShoppingList: (id: string) => void;
  resetData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
}

const DB_KEY = 'CLT_FINANCEIRO_DATA';

const initialData: AppData = {
  user: null,
  accounts: [],
  transactions: [],
  schedules: [],
  benefits: [],
  budgets: [],
  goals: [],
  installments: [],
  shoppingLists: []
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialData);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem(DB_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Garantir compatibilidade com dados existentes
        const migratedData = migrateData(parsedData);
        setData(migratedData);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        setData(initialData);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }, [data]);

  // Migração de dados para garantir compatibilidade
  const migrateData = (savedData: any): AppData => {
    const migrated = { ...initialData, ...savedData };

    // Migração de benefícios (adicionar inCash se não existir)
    if (migrated.benefits) {
      migrated.benefits = migrated.benefits.map((benefit: any) => ({
        ...benefit,
        inCash: benefit.inCash ?? false
      }));
    }

    // Migração de agendamentos (adicionar payments se não existir)
    if (migrated.schedules) {
      migrated.schedules = migrated.schedules.map((schedule: any) => ({
        ...schedule,
        payments: schedule.payments ?? []
      }));
    }

    // Migração de parcelamentos (adicionar payments se não existir)
    if (migrated.installments) {
      migrated.installments = migrated.installments.map((installment: any) => ({
        ...installment,
        payments: installment.payments ?? []
      }));
    }

    // Garantir que listas de compras existam
    if (!migrated.shoppingLists) {
      migrated.shoppingLists = [];
    }

    return migrated;
  };

  const updateUser = (user: User) => {
    setData(prev => ({ ...prev, user }));
  };

  const addAccount = (account: Account) => {
    setData(prev => ({
      ...prev,
      accounts: [...prev.accounts, account]
    }));
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(account =>
        account.id === id ? { ...account, ...updates } : account
      )
    }));
  };

  const deleteAccount = (id: string) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.filter(account => account.id !== id),
      transactions: prev.transactions.filter(transaction => transaction.accountId !== id)
    }));
  };

  const addTransaction = (transaction: Transaction) => {
    setData(prev => {
      // Atualizar saldo da conta
      const updatedAccounts = prev.accounts.map(account => {
        if (account.id === transaction.accountId) {
          const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
          return { ...account, balance: account.balance + amount };
        }
        return account;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: [...prev.transactions, transaction]
      };
    });
  };

  const deleteTransaction = (id: string) => {
    setData(prev => {
      const transaction = prev.transactions.find(t => t.id === id);
      if (!transaction) return prev;

      // Reverter saldo da conta
      const updatedAccounts = prev.accounts.map(account => {
        if (account.id === transaction.accountId) {
          const amount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
          return { ...account, balance: account.balance + amount };
        }
        return account;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        transactions: prev.transactions.filter(t => t.id !== id)
      };
    });
  };

  const addSchedule = (schedule: Schedule) => {
    setData(prev => ({
      ...prev,
      schedules: [...prev.schedules, schedule]
    }));
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>) => {
    setData(prev => ({
      ...prev,
      schedules: prev.schedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      )
    }));
  };

  const deleteSchedule = (id: string) => {
    setData(prev => ({
      ...prev,
      schedules: prev.schedules.filter(schedule => schedule.id !== id)
    }));
  };

  const addBenefit = (benefit: Benefit) => {
    setData(prev => ({
      ...prev,
      benefits: [...prev.benefits, benefit]
    }));
  };

  const updateBenefit = (id: string, updates: Partial<Benefit>) => {
    setData(prev => ({
      ...prev,
      benefits: prev.benefits.map(benefit =>
        benefit.id === id ? { ...benefit, ...updates } : benefit
      )
    }));
  };

  const deleteBenefit = (id: string) => {
    setData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit.id !== id)
    }));
  };

  const addBudget = (budget: Budget) => {
    setData(prev => ({
      ...prev,
      budgets: [...prev.budgets, budget]
    }));
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(budget =>
        budget.id === id ? { ...budget, ...updates } : budget
      )
    }));
  };

  const deleteBudget = (id: string) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.filter(budget => budget.id !== id)
    }));
  };

  const addGoal = (goal: Goal) => {
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }));
  };

  const deleteGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }));
  };

  const addInstallment = (installment: Installment) => {
    setData(prev => ({
      ...prev,
      installments: [...prev.installments, installment]
    }));
  };

  const updateInstallment = (id: string, updates: Partial<Installment>) => {
    setData(prev => ({
      ...prev,
      installments: prev.installments.map(installment =>
        installment.id === id ? { ...installment, ...updates } : installment
      )
    }));
  };

  const deleteInstallment = (id: string) => {
    setData(prev => ({
      ...prev,
      installments: prev.installments.filter(installment => installment.id !== id)
    }));
  };

  const addShoppingList = (list: ShoppingList) => {
    setData(prev => ({
      ...prev,
      shoppingLists: [...prev.shoppingLists, list]
    }));
  };

  const updateShoppingList = (id: string, updates: Partial<ShoppingList>) => {
    setData(prev => ({
      ...prev,
      shoppingLists: prev.shoppingLists.map(list =>
        list.id === id ? { ...list, ...updates } : list
      )
    }));
  };

  const deleteShoppingList = (id: string) => {
    setData(prev => ({
      ...prev,
      shoppingLists: prev.shoppingLists.filter(list => list.id !== id)
    }));
  };

  const resetData = () => {
    localStorage.removeItem(DB_KEY);
    setData(initialData);
  };

  const exportData = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData);
      const migratedData = migrateData(parsedData);
      setData(migratedData);
    } catch (error) {
      throw new Error('Dados inválidos para importação');
    }
  };

  const value: DataContextType = {
    data,
    updateUser,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addBenefit,
    updateBenefit,
    deleteBenefit,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addInstallment,
    updateInstallment,
    deleteInstallment,
    addShoppingList,
    updateShoppingList,
    deleteShoppingList,
    resetData,
    exportData,
    importData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};