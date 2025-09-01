import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Brain, LineChart, Shield, Target } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils/formatters';
import { calculateCurrentTotalBalance, calculatePostPaycheckBalance, calculateFinancialScore } from '../utils/calculations';
import UpcomingPayments from '../components/UpcomingPayments';

interface CarouselSlide {
  Icon: React.FC<any>;
  title: string;
  text: string;
  buttonText?: string;
  link?: string;
  color: string;
}

export const Dashboard: React.FC = () => {
  const { data } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!data.user) {
    return <Navigate to="/onboarding" />;
  }

  const carouselSlides: CarouselSlide[] = [
    {
      Icon: Brain,
      title: 'Novo Assistente Financeiro',
      text: 'Receba dicas e análises detalhadas sobre as suas finanças na nova secção do menu.',
      buttonText: 'Analisar Agora',
      link: '/assistant',
      color: 'bg-indigo-500'
    },
    {
      Icon: LineChart,
      title: 'Planeie o Seu Futuro',
      text: 'Já viu a nossa ferramenta de Projeções? Simule o crescimento do seu património.',
      buttonText: 'Ver Projeções',
      link: '/projections',
      color: 'bg-green-500'
    },
    {
      Icon: Shield,
      title: 'A Sua Privacidade é Total',
      text: 'Lembre-se: todos os seus dados ficam guardados apenas no seu dispositivo.',
      color: 'bg-slate-600'
    },
    {
      Icon: Target,
      title: 'Alcance os Seus Sonhos',
      text: 'Defina metas financeiras e acompanhe o seu progresso para se manter motivado.',
      buttonText: 'Definir Metas',
      link: '/goals',
      color: 'bg-orange-500'
    }
  ];

  const currentBalance = calculateCurrentTotalBalance(data.accounts);
  const postPaycheckBalance = calculatePostPaycheckBalance(data);
  const totalMonthlyBenefits = data.benefits
    .filter(b => b.inCash)
    .reduce((sum, b) => sum + (b.amount || 0), 0);
  const projectedBalanceWithBenefits = postPaycheckBalance + totalMonthlyBenefits;
  const financialScore = calculateFinancialScore(data);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(current => 
        current === carouselSlides.length - 1 ? 0 : current + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          Olá, {data.user.name.split(' ')[0]}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Aqui está seu resumo financeiro.
        </p>
      </header>

      <section className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-slate-700 dark:text-slate-200">Score Financeiro</h2>
              <p className="text-3xl font-bold text-indigo-500">{financialScore}</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
              <span className="text-2xl font-bold text-indigo-500">
                {Math.round((financialScore/1000)*100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-48 rounded-lg shadow overflow-hidden">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              } ${slide.color} text-white p-6 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <slide.Icon className="w-6 h-6" />
                  <h3 className="font-bold text-lg">{slide.title}</h3>
                </div>
                <p className="text-sm">{slide.text}</p>
              </div>
              {slide.buttonText && slide.link && (
                <Link
                  to={slide.link}
                  className="bg-white/30 hover:bg-white/50 text-white font-bold py-2 px-4 rounded-lg text-sm self-start"
                >
                  {slide.buttonText}
                </Link>
              )}
            </div>
          ))}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-500 dark:text-slate-400">
              Saldo Atual em Contas
            </h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-500 dark:text-slate-400">
              Saldo no Próximo Pagamento <span className="text-xs">(est.)</span>
            </h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(postPaycheckBalance)}
            </p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow-sm border border-green-200 dark:border-green-500/30">
          <h3 className="font-semibold text-green-800 dark:text-green-200">
            Saldo Projetado + Benefícios
          </h3>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(projectedBalanceWithBenefits)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Uma estimativa do seu poder de compra total no próximo ciclo.
          </p>
        </div>

        <UpcomingPayments
          schedules={data.schedules}
          installments={data.installments}
        />
      </section>


    </div>
  );
};


