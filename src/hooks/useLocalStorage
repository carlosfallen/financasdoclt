import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // State para armazenar nosso valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Retorna uma versão envolvida da função setState do useState que persiste o novo valor no localStorage.
  const setValue = (value) => {
    try {
      // Permite que o valor seja uma função para que tenhamos a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

// Hook especializado para os dados da aplicação
export function useAppData() {
  const [data, setData] = useLocalStorage('CLT_FINANCEIRO_DATA', {
    user: null,
    accounts: [],
    transactions: [],
    schedules: [],
    benefits: [],
    budgets: [],
    goals: [],
    installments: [],
    shoppingLists: []
  })

  const updateData = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addItem = (collectionName, item) => {
    setData(prev => ({
      ...prev,
      [collectionName]: [...(prev[collectionName] || []), item]
    }))
  }

  const updateItem = (collectionName, itemId, updatedProperties) => {
    setData(prev => ({
      ...prev,
      [collectionName]: prev[collectionName].map(item =>
        item.id === itemId ? { ...item, ...updatedProperties } : item
      )
    }))
  }

  const deleteItem = (collectionName, itemId) => {
    setData(prev => ({
      ...prev,
      [collectionName]: prev[collectionName].filter(item => item.id !== itemId)
    }))
  }

  const resetDatabase = () => {
    localStorage.removeItem('CLT_FINANCEIRO_DATA')
    window.location.href = '/features'
    window.location.reload()
  }

  return {
    data,
    updateData,
    addItem,
    updateItem,
    deleteItem,
    resetDatabase
  }
}