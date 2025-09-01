import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import type { Transaction } from '../types';

const Transactions: React.FC = () => {
  const { data, addTransaction, deleteTransaction } = useData();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: '',
    accountId: ''
  });

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(transaction => {
      return transaction.date.startsWith(selectedMonth);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.transactions, selectedMonth]);

  const monthlyTotals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const handleOpenModal = () => {
    setFormData({
      type: 'expense',
      category: '',
      description: '',
      amount: '',
      date: '',
      accountId: data.accounts[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showToast('Por favor, insira uma descrição', 'error');
      return;
    }

    if (!formData.category) {
      showToast('Por favor, selecione uma categoria', 'error');
      return;
    }

    if (!formData.accountId) {
      showToast('Por favor, selecione uma conta', 'error');
      return;
    }

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Por favor, insira um valor válido', 'error');
      return;
    }

    if (!formData.date) {
      showToast('Por favor, selecione uma data', 'error');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      type: formData.type,
      category: formData.category,
      description: formData.description.trim(),
      amount,
      date: formData.date,
      accountId: formData.accountId
    };

    addTransaction(transaction);
    showToast('Transação adicionada com sucesso!', 'success');
    handleCloseModal();
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm('Deseja realmente excluir esta transação?')) {
      deleteTransaction(transaction.id);
      showToast('Transação excluída com sucesso!', 'success');
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transações
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
        >
          Nova Transação
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return (
                <option key={value} value={value}>
                  {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
              Receitas
            </h3>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
              {formatCurrency(monthlyTotals.income)}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Despesas
            </h3>
            <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
              {formatCurrency(monthlyTotals.expense)}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Saldo do Mês
            </h3>
            <p className={`text-lg font-bold mt-1 ${
              monthlyTotals.income - monthlyTotals.expense >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(monthlyTotals.income - monthlyTotals.expense)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {filteredTransactions.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Nenhuma transação encontrada neste mês
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {transaction.description}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(transaction.date)} - {
                        data.accounts.find(a => a.id === transaction.accountId)?.name
                      }
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {categories.find(c => c.value === transaction.category)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} 
                      {formatCurrency(transaction.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Nova Transação
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.type === 'expense'}
                      onChange={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Despesa</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.type === 'income'}
                      onChange={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Receita</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="Ex: Compras do mercado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valor
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Conta
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione uma conta</option>
                    {data.accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
