import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, MoreHorizontal, Plus } from 'lucide-react';

interface BottomNavigationProps {
  onQuickAdd: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onQuickAdd }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Extrato' },
    { path: '/budgets', icon: PiggyBank, label: 'Orçamento' },
    { path: '/more', icon: MoreHorizontal, label: 'Mais' },
  ];

  const isHidden = ['/', '/auth', '/onboarding'].includes(location.pathname);

  if (isHidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto h-16 bg-white dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 flex justify-around items-center z-50">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        if (index === 2) {
          return (
            <React.Fragment key={item.path}>
              <button
                onClick={onQuickAdd}
                className="bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center -mt-8 shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-8 h-8" />
              </button>
              <Link
                to={item.path}
                className={`flex flex-col items-center justify-center ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </React.Fragment>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center ${
              isActive ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;