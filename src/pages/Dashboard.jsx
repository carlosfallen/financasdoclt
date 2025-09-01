import React from 'react'
import { Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useAppData } from '../hooks/useLocalStorage'
import { formatCurrency } from '../utils'

export function Dashboard() {
  const { data } = useAppData()
  const { user, accounts = [], transactions = [], schedules = [] } = data

  // Cálculos do dashboard
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  
  const today = new Date()
  const currentMonth = today.toISOString().slice(0, 7)
  
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth))
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const upcomingSchedules = schedules.slice(0, 3)

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Olá, {user.name}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Aqui está um resumo das suas finanças
        </p>
      </header>

      {/* Saldo Total */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6" />
          <span className="text-sm opacity-90">Saldo Total</span>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
      </div>

      {/* Resumo Mensal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className