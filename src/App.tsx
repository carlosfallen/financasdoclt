import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { BottomNav } from './components/layout/BottomNav'
import { QuickAddModal } from './components/modals/QuickAddModal'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { More } from './pages/More'
import { Onboarding } from './pages/Onboarding'
import { Features } from './pages/Features'
import { Accounts } from './pages/Accounts'
import { Schedules } from './pages/Schedules'
import { Benefits } from './pages/Benefits'
import { Goals } from './pages/Goals'
import { Projections } from './pages/Projections'
import { Installments } from './pages/Installments'
import { Settings } from './pages/Settings'
import { Assistant } from './pages/Assistant'
import { ShoppingLists } from './pages/ShoppingLists'
import './index.css'

function App() {
  const [user] = useLocalStorage('user', null)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  // Verifica se deve mostrar nav bar
  const shouldShowNav = (pathname) => {
    const hiddenRoutes = ['/features', '/onboarding']
    return !hiddenRoutes.includes(pathname)
  }

  return (
    <Router>
      <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-slate-800 shadow-2xl relative">
        <main className="p-4 pb-24">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/features" element={<Features />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Rotas privadas */}
            {user && user.salary ? (
              <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/more" element={<More />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/schedules" element={<Schedules />} />
                <Route path="/benefits" element={<Benefits />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/projections" element={<Projections />} />
                <Route path="/installments" element={<Installments />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/shopping-lists" element={<ShoppingLists />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/features" replace />} />
            )}
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <Routes>
          <Route path="/features" element={null} />
          <Route path="/onboarding" element={null} />
          <Route
            path="*"
            element={
              user && user.salary ? (
                <BottomNav onQuickAdd={() => setIsQuickAddOpen(true)} />
              ) : null
            }
          />
        </Routes>

        {/* Quick Add Modal */}
        {isQuickAddOpen && (
          <QuickAddModal
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
          />
        )}
      </div>
    </Router>
  )
}

export default App