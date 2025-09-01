import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import { ACCOUNT_TYPES } from '../utils/constants';
import { Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

const Accounts: React.FC = () => {
  const { data, addAccount, updateAccount, deleteAccount } = useData();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: ACCOUNT_TYPES[0].value,
    balance: ''
  });

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString()
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: ACCOUNT_TYPES[0].value,
        balance: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('Por favor, insira um nome para a conta', 'error');
      return;
    }

    const balance = Number(formData.balance);
    if (isNaN(balance)) {
      showToast('Por favor, insira um saldo válido', 'error');
      return;
    }

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: formData.name.trim(),
        type: formData.type,
        balance
      });
      showToast('Conta atualizada com sucesso!', 'success');
    } else {
      addAccount({
        id: uuidv4(),
        name: formData.name.trim(),
        type: formData.type,
        balance
      });
      showToast('Conta criada com sucesso!', 'success');
    }

    handleCloseModal();
  };

  const handleDelete = (account: Account) => {
    if (window.confirm(`Deseja realmente excluir a conta ${account.name}?`)) {
      deleteAccount(account.id);
      showToast('Conta excluída com sucesso!', 'success');
    }
  };

  const totalBalance = data.accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Minhas Contas
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gerencie suas contas e acompanhe seus saldos
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
        >
          Nova Conta
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.accounts.map(account => (
          <div
            key={account.id}
            className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {account.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(account)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(account)}
                  className="text-red-500 hover:text-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
            <p className={`text-lg font-bold ${
              account.balance >= 0 
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(account.balance)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Saldo Total
        </h2>
        <p className={`text-2xl font-bold ${
          totalBalance >= 0 
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nome da Conta
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="Ex: Banco XYZ"
                  />
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tipo de Conta
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as Account['type'] }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  >
                    {ACCOUNT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="balance"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    id="balance"
                    value={formData.balance}
                    onChange={e => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="0,00"
                    step="0.01"
                  />
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
                    {editingAccount ? 'Salvar Alterações' : 'Criar Conta'}
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

export default Accounts;
