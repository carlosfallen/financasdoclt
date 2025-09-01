import { v4 as uuidv4 } from 'uuid'

export function generateId() {
  return uuidv4()
}

export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    value = 0
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(isoDateString) {
  if (!isoDateString || !isoDateString.includes('-')) {
    return 'Data inválida'
  }
  // Lida tanto com 'YYYY-MM-DD' quanto com 'YYYY-MM-DDTHH:mm:ss.sssZ'
  const datePart = isoDateString.split('T')[0]
  const [year, month, day] = datePart.split('-')
  return `${day}/${month}/${year}`
}

export function showToast(message, type = 'info') {
  // Implementação simples de toast - pode ser melhorada com uma lib como react-hot-toast
  const toast = document.createElement('div')
  const colors = { 
    success: 'bg-green-500', 
    error: 'bg-red-500', 
    info: 'bg-blue-500' 
  }
  
  toast.className = `fixed top-5 right-5 ${colors[type]} text-white py-2 px-4 rounded-lg shadow-lg z-50 transition-all duration-300`
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}