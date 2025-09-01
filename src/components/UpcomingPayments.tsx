import React from 'react';
import { formatCurrency } from '../utils/formatters';
import type { Schedule, Installment } from '../types';

interface UpcomingPaymentsProps {
  schedules: Schedule[];
  installments: Installment[];
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ schedules, installments }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const currentMonth = today.toISOString().slice(0, 7);
  
  interface UpcomingPayment {
    description: string;
    amount: number;
    date: Date;
    type: 'Agendamento' | 'Parcela';
  }
  
  const upcomingPayments: UpcomingPayment[] = [];

  // Processar agendamentos
  schedules.forEach(schedule => {
    const paidThisMonth = schedule.payments?.some(p => p.month === currentMonth);
    if (paidThisMonth) return;

    let nextDueDate = new Date(today.getFullYear(), today.getMonth(), schedule.dueDay);
    if (nextDueDate < today) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    if (nextDueDate <= thirtyDaysFromNow) {
      upcomingPayments.push({
        description: schedule.name,
        amount: schedule.amount,
        date: nextDueDate,
        type: 'Agendamento'
      });
    }
  });

  // Processar parcelamentos
  installments.forEach(item => {
    if ((item.payments?.length || 0) >= item.totalInstallments) return;

    const paidCount = item.payments?.length || 0;
    const startDate = new Date(item.startDate);
    const monthsSinceStart = (today.getFullYear() - startDate.getFullYear()) * 12 
      + (today.getMonth() - startDate.getMonth());
    
    const isDueOrOverdue = monthsSinceStart >= paidCount;
    
    if (isDueOrOverdue) {
      const installmentDueDay = 15;
      let nextPaymentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + paidCount,
        installmentDueDay
      );

      if (nextPaymentDate < today) {
        nextPaymentDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          installmentDueDay
        );
        if (nextPaymentDate < today) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
      }

      if (nextPaymentDate <= thirtyDaysFromNow) {
        upcomingPayments.push({
          description: `${item.description} (${paidCount + 1}/${item.totalInstallments})`,
          amount: item.monthlyPayment,
          date: nextPaymentDate,
          type: 'Parcela'
        });
      }
    }
  });

  // Ordenar por data
  upcomingPayments.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="card">
      <h3 className="font-bold text-lg mb-2">Próximos Vencimentos</h3>
      {upcomingPayments.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhum vencimento pendente para os próximos 30 dias.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcomingPayments.slice(0, 5).map((payment, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold">{payment.description}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {payment.type} - Vence em {payment.date.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className="font-bold text-red-500">
                {formatCurrency(payment.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingPayments;
