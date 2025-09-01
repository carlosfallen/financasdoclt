import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Trash2, CalendarOff } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../hooks/useToast';
import { formatCurrency, generateId } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../config/categories';
import type { Schedule, Account } from '../types';
import Modal from '../components/UI/Modal';

interface ScheduleFormData {
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  type: 'expense';
  startDate: string;
}

const Schedules: React.FC = () => {
  const { data, addSchedule, updateSchedule, deleteSchedule, addTransaction, updateAccount } = useData();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const schedules = data.schedules.sort((a, b) => a.dueDay - b.dueDay);

  const handleAddClick = () => {
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handlePayClick = (schedule: Schedule) => {
    if (!data.accounts || data.accounts.length === 0) {
      showToast('Precisa de ter uma conta para registar um pagamento.', 'error');
      return;
    }
    setSelectedSchedule(schedule);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteClick = async (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento recorrente?')) {
      deleteSchedule(scheduleId);
      showToast('Agendamento excluído.', 'success');
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const scheduleData: ScheduleFormData = {
      name: formData.get('schedule-desc') as string,
      amount: parseFloat(formData.get('schedule-amount') as string),
      dueDay: parseInt(formData.get('schedule-due-date') as string),
      category: formData.get('schedule-category') as string,
      type: 'expense',
      startDate: new Date().toISOString().split('T')[0],
    };

    if (selectedSchedule) {
      updateSchedule(selectedSchedule.id, scheduleData);
      showToast('Agendamento atualizado!', 'success');
    } else {
      addSchedule({
        ...scheduleData,
        id: generateId(),
        payments: [],
      });
      showToast('Agendamento criado!', 'success');
    }

    setIsModalOpen(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const accountId = formData.get('payment-account') as string;
    const account = data.accounts.find(a => a.id === accountId);
    
    if (!account) return;

    const transactionId = generateId();
    const newTransaction = {
      id: transactionId,
      accountId: accountId,
      type: 'expense' as const,
      amount: selectedSchedule.amount,
      description: selectedSchedule.name,
      category: selectedSchedule.category,
      date: new Date().toISOString().split('T')[0],
    };

    // Adicionar transação
    addTransaction(newTransaction);

    // Atualizar saldo da conta
    updateAccount(accountId, { balance: account.balance - selectedSchedule.amount });

    // Atualizar pagamentos do agendamento
        const updatedPayments = [...(selectedSchedule.payments || []), { 
      month: currentMonth, 
      transactionId,
      paidAt: new Date().toISOString()
    }];
    updateSchedule(selectedSchedule.id, { payments: updatedPayments });

    showToast('Pagamento registado!', 'success');
    setIsPaymentModalOpen(false);
  };

  const renderScheduleItem = (schedule: Schedule) => {
    const category = EXPENSE_CATEGORIES.find(c => c.value === schedule.category);
    const payments = schedule.payments || [];
    const paidThisMonth = payments.some(p => p.month === currentMonth);

    const StatusComponent = paidThisMonth ? (
      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 dark:bg-green-900/50 dark:text-green-200 rounded-full flex items-center gap-1">
        <Check className="w-4 h-4" />
        Pago este mês
      </span>
    ) : (
      <button
        onClick={() => handlePayClick(schedule)}
        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
      >
        Registar Pagamento
      </button>
    );

    return (
      <div key={schedule.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              {React.createElement(category?.icon || 'Tag', { size: 32 })}
            </span>
            <div>
              <p className="font-bold text-lg">{schedule.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Vence todo dia {schedule.dueDay}
              </p>
              <p className="font-bold text-red-500 text-xl">
                {formatCurrency(schedule.amount)}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDeleteClick(schedule.id)}
            className="text-slate-500 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="text-right">{StatusComponent}</div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <CalendarOff className="w-16 h-16 mx-auto text-slate-400 mb-4" />
      <h3 className="text-xl font-semibold">Nenhum Agendamento</h3>
      <p className="text-slate-500">Cadastre suas contas recorrentes como aluguel e internet.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <a href="#more" className="text-indigo-500">
            <ArrowLeft />
          </a>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo</span>
        </button>
      </header>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
        <p>Aqui ficam as suas despesas recorrentes. Registe o pagamento de cada uma delas todos os meses.</p>
      </div>

      <section className="space-y-3">
        {schedules.length > 0 ? schedules.map(renderScheduleItem) : renderEmptyState()}
      </section>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={selectedSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label htmlFor="schedule-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrição
              </label>
              <input
                type="text"
                id="schedule-desc"
                name="schedule-desc"
                required
                defaultValue={selectedSchedule?.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="schedule-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                id="schedule-amount"
                name="schedule-amount"
                required
                defaultValue={selectedSchedule?.amount}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="schedule-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dia do Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                id="schedule-due-date"
                name="schedule-due-date"
                required
                defaultValue={selectedSchedule?.dueDay}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="schedule-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria
              </label>
              <select
                id="schedule-category"
                name="schedule-category"
                required
                defaultValue={selectedSchedule?.category}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              >
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Pagamento */}
      {isPaymentModalOpen && selectedSchedule && (
        <Modal
          isOpen={isPaymentModalOpen}
          title={`Pagar ${selectedSchedule.name}`}
          onClose={() => setIsPaymentModalOpen(false)}
        >
          <form onSubmit={handlePaymentSubmit}>
            <p>
              Confirme o pagamento de {formatCurrency(selectedSchedule.amount)} para o mês corrente.
            </p>
            <div className="mt-4">
              <label htmlFor="payment-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pagar com a conta:
              </label>
              <select
                id="payment-account"
                name="payment-account"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              >
                {data.accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Confirmar Pagamento
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Schedules;
