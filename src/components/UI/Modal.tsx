import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
        <header className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        <main className="p-4 overflow-y-auto flex-1">
          {children}
        </main>
        {footer && (
          <footer className="p-4 border-t dark:border-slate-700">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;