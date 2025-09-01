import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, PiggyBank, MoreHorizontal, Plus } from 'lucide-react'

export function BottomNav({ onQuickAdd }) {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Extrato' },
    { to: '/budgets', icon: PiggyBank, label: 'Orçamento' },
    { to: '/more', icon: MoreHorizontal, label: 'Mais' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto h-16 bg-white dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 flex justify-around items-center z-50">
      {navItems.map((item, index) => (
        <React.Fragment key={item.to}>
          {index === 2 && (
            <button
              onClick={onQuickAdd}
              className="bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center -mt-8 shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-8 h-8" />
            </button>
          )}
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-slate-500 transition-colors ${
                isActive ? 'text-indigo-500' : 'hover:text-slate-700'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        </React.Fragment>
      ))}
    </nav>
  )
}