import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useToast } from '../hooks/useToast';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useData();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    salary: '',
    paymentType: 'fixed' as 'fixed' | 'business',
    paymentDay: '5'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.salary || isNaN(Number(formData.salary))) {
      showToast('Por favor, insira um salário válido', 'error');
      return;
    }

    if (!formData.name.trim()) {
      showToast('Por favor, insira seu nome', 'error');
      return;
    }

    const paymentDay = Number(formData.paymentDay);
    if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
      showToast('Por favor, insira um dia de pagamento válido (1-31)', 'error');
      return;
    }

    updateUser({
      name: formData.name.trim(),
      salary: Number(formData.salary),
      paymentType: formData.paymentType,
      paymentDay
    });
    
    showToast('Configuração concluída!', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Bem-vindo ao Finanças do CLT
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Vamos começar configurando seu salário
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Salário Bruto
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Seu salário bruto"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Pagamento
              </label>
              <select
                id="paymentType"
                name="paymentType"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                value={formData.paymentType}
                onChange={handleChange}
              >
                <option value="fixed">Fixo (CLT)</option>
                <option value="business">PJ/Autônomo</option>
              </select>
            </div>

            <div>
              <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dia do Pagamento
              </label>
              <input
                id="paymentDay"
                name="paymentDay"
                type="number"
                min="1"
                max="31"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Dia do mês (1-31)"
                value={formData.paymentDay}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Começar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
