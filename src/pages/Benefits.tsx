import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import { generateId } from '../utils/formatters';
import type { Benefit } from '../types';

const Benefits: React.FC = () => {
  const { data, addBenefit, updateBenefit, deleteBenefit } = useData();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    receiptDay: '',
    inCash: false
  });

  const handleOpenModal = (benefit?: Benefit) => {
    if (benefit) {
      setEditingBenefit(benefit);
      setFormData({
        name: benefit.name,
        amount: benefit.amount.toString(),
        receiptDay: benefit.receiptDay.toString(),
        inCash: benefit.inCash
      });
    } else {
      setEditingBenefit(null);
      setFormData({
        name: '',
        amount: '',
        receiptDay: '',
        inCash: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBenefit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Por favor, insira o nome do benefício', 'error');
      return;
    }

    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Por favor, insira um valor válido', 'error');
      return;
    }

    const receiptDay = Number(formData.receiptDay);
    if (isNaN(receiptDay) || receiptDay < 1 || receiptDay > 31) {
      showToast('Por favor, insira um dia válido (1-31)', 'error');
      return;
    }

    const benefitData = {
      name: formData.name.trim(),
      amount,
      receiptDay,
      inCash: formData.inCash
    };

    if (editingBenefit) {
      updateBenefit(editingBenefit.id, benefitData);
      showToast('Benefício atualizado com sucesso!', 'success');
    } else {
      addBenefit({
        id: generateId(),
        ...benefitData
      });
      showToast('Benefício adicionado com sucesso!', 'success');
    }

    handleCloseModal();
  };

  const handleDelete = (benefit: Benefit) => {
    if (window.confirm(`Deseja realmente excluir o benefício ${benefit.name}?`)) {
      deleteBenefit(benefit.id);
      showToast('Benefício excluído com sucesso!', 'success');
    }
  };

  const totalBenefitsValue = data.benefits.reduce((sum, benefit) => sum + benefit.amount, 0);
  const cashBenefitsValue = data.benefits
    .filter(b => b.inCash)
    .reduce((sum, benefit) => sum + benefit.amount, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Benefícios
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gerencie seus benefícios e vales
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
        >
          Novo Benefício
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Valor Total em Benefícios
          </h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalBenefitsValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Benefícios em Dinheiro
          </h2>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(cashBenefitsValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Benefícios em Vale
          </h2>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(totalBenefitsValue - cashBenefitsValue)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {data.benefits.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Nenhum benefício cadastrado
            </div>
          ) : (
            data.benefits.map(benefit => (
              <div 
                key={benefit.id} 
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {benefit.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Recebimento: dia {benefit.receiptDay}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {benefit.inCash ? 'Em dinheiro' : 'Vale'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(benefit.amount)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(benefit)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(benefit)}
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
                {editingBenefit ? 'Editar Benefício' : 'Novo Benefício'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nome do Benefício
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="Ex: Vale Alimentação"
                  />
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Valor
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="0,00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label
                    htmlFor="receiptDay"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Dia do Recebimento
                  </label>
                  <input
                    type="number"
                    id="receiptDay"
                    value={formData.receiptDay}
                    onChange={e => setFormData(prev => ({ ...prev, receiptDay: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                    placeholder="1-31"
                    min="1"
                    max="31"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inCash"
                    checked={formData.inCash}
                    onChange={e => setFormData(prev => ({ ...prev, inCash: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="inCash"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Recebido em dinheiro
                  </label>
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
                    {editingBenefit ? 'Salvar Alterações' : 'Adicionar Benefício'}
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

export default Benefits;
