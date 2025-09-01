import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/UI/ToastContainer';

// Pages
import Onboarding from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Benefits from './pages/Benefits';
import Goals from './pages/Goals';
import Schedules from './pages/Schedules';

// Layout Components
import Layout from './components/Layout/index';

// Componente para verificar autenticação
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userData = localStorage.getItem('CLT_FINANCEIRO_DATA');
  const hasUser = userData ? JSON.parse(userData)?.user : null;

  if (!hasUser) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
export const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar preferência de tema do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(mediaQuery.matches);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Aplicar classe dark ao html quando o modo escuro estiver ativo
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <DataProvider>
        <ToastProvider>
          <div className={isDarkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
              <ToastContainer />
              <Routes>
                {/* Rotas públicas */}
                <Route path="/onboarding" element={<Onboarding />} />
                
                {/* Rotas protegidas */}
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Layout><Dashboard /></Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <RequireAuth>
                      <Layout><Transactions /></Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/accounts"
                  element={
                    <RequireAuth>
                      <Layout><Accounts /></Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/benefits"
                  element={
                    <RequireAuth>
                      <Layout><Benefits /></Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/schedules"
                  element={
                    <RequireAuth>
                      <Layout><Schedules /></Layout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <RequireAuth>
                      <Layout><Goals /></Layout>
                    </RequireAuth>
                  }
                />
                
                {/* Rota padrão */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                
                {/* Fallback */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </div>
          </div>
        </ToastProvider>
      </DataProvider>
    </Router>
  );
};

  //