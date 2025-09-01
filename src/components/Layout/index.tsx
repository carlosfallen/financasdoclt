import React, { useState } from 'react';
import BottomNavigation from './BottomNavigation';
// @ts-expect-error: JSX file without types
import QuickAddModal from '../modals/QuickAddModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleQuickAdd = () => {
    setIsQuickAddOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      <BottomNavigation onQuickAdd={handleQuickAdd} />
      {isQuickAddOpen && (
        <QuickAddModal onClose={() => setIsQuickAddOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
