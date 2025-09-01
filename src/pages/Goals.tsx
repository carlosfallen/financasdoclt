import React, { useState } from 'react';
import { Target, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate, generateId } from '../utils/formatters';
import Modal from '../components/UI/Modal';
import type { Goal } from '../types';

interface GoalFormData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

const Goals: React.FC = () => {
  const { data, addGoal, updateGoal, deleteGoal } = useData();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleAddClick = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (goalId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteGoal(goalId);
      showToast('Meta excluída.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const goalData: GoalFormData = {
      name: formData.get('goal-name') as string,
      targetAmount: parseFloat(formData.get('goal-target') as string),
      currentAmount: parseFloat(formData.get('goal-current') as string),
      deadline: formData.get('goal-deadline') as string,
    };

    if (selectedGoal) {
      updateGoal(selectedGoal.id, goalData);
      showToast('Meta atualizada!', 'success');
    } else {
      addGoal({
        ...goalData,
        id: generateId(),
      });
      showToast('Meta criada!', 'success');
    }

    setIsModalOpen(false);
  };

  const renderGoalItem = (goal: Goal) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const deadlineText = goal.deadline ? formatDate(goal.deadline) : 'Não definido';

    return (
      <div key={goal.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg">{goal.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Prazo: {deadlineText}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEditClick(goal)}
              className="p-1 text-slate-500 hover:text-indigo-500"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteClick(goal.id)}
              className="p-1 text-slate-500 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span className="text-slate-500">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-indigo-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs mt-1 font-semibold">{progress.toFixed(1)}%</p>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
      <h3 className="text-xl font-semibold">Nenhuma Meta Definida</h3>
      <p className="text-slate-500">Crie metas para alcançar seus objetivos financeiros.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <a href="#more" className="text-indigo-500">
            <ArrowLeft />
          </a>
          <h1 className="text-2xl font-bold">Metas</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Meta</span>
        </button>
      </header>

      <section className="space-y-3">
        {data.goals.length > 0 ? data.goals.map(renderGoalItem) : renderEmptyState()}
      </section>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={selectedGoal ? 'Editar Meta' : 'Nova Meta'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome da Meta
              </label>
              <input
                type="text"
                id="goal-name"
                name="goal-name"
                required
                defaultValue={selectedGoal?.name}
                placeholder="Ex: Viagem de Férias"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="goal-target" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor Alvo
              </label>
              <input
                type="number"
                step="0.01"
                id="goal-target"
                name="goal-target"
                required
                defaultValue={selectedGoal?.targetAmount}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="goal-current" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor Atual
              </label>
              <input
                type="number"
                step="0.01"
                id="goal-current"
                name="goal-current"
                required
                defaultValue={selectedGoal?.currentAmount || '0'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="goal-deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prazo Final
              </label>
              <input
                type="date"
                id="goal-deadline"
                name="goal-deadline"
                defaultValue={selectedGoal?.deadline}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white sm:text-sm"
              />
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
    </div>
  );
};

export default Goals;
