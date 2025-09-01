import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useAppData } from '../../hooks/useLocalStorage'
import { generateId, showToast } from '../../utils'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../config'

export function QuickAddModal({ isOpen, onClose }) {
  const { data, addItem, updateItem } = useAppData()
  const [transactionType, setTransactionType] = useState('expense')
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    accountId: data.accounts[0]?.id || '',
    category: EXPENSE_CATEGORIES[0]?.value || ''
  })

  const accounts = data.accounts || []

  if (!isOpen || accounts.length === 0) {
    if (accounts.length === 0 && isOpen) {
      showToast('É necessário criar uma conta primeiro!', 'error')
      onClose()
    }
    return null
  }

  const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTypeChange = (type) => {
    setTransactionType(type)
    const newCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    setFormData(prev => ({
      ...prev,
      category: newCategories[0]?.value || ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const account = accounts.find(acc => acc.id === formData.accountId)
    if (!account) {
      showToast('Erro: Conta inválida.', 'error')
      return
    }

    const amount = parseFloat(formData.amount)
    const newBalance = transactionType === 'income' 
      ? account.balance + amount 
      : account.balance - amount

    const newTransaction = {
      id: generateId(),
      type: transactionType,
      description: formData.description,
      amount: amount,
      date: formData.date,
      accountId: formData.accountId,
      category: formData.category
    }

    addItem('transactions', newTransaction)
    updateItem('accounts', formData.accountId, { balance: newBalance })
    
    showToast('Lançamento salvo!', 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">Novo Lançamento</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-4 rounded-lg font-semibold ${
                transactionType === 'expense'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-4 rounded-lg font-semibold ${
                transactionType === 'income'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conta</label>
            <select
              name="accountId"
              value={formData.accountId}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  )
}