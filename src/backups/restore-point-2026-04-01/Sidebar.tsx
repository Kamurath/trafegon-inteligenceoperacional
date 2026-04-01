// BACKUP OF /src/components/Sidebar.tsx as of 2026-04-01
import React from 'react';
import { LayoutDashboard, Calendar, Info, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'pauta', icon: LayoutDashboard, label: 'Pauta' },
    { id: 'aniversariantes', icon: Calendar, label: 'Aniversariantes' },
    { id: 'informacoes', icon: Info, label: 'Informações' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-[#050714] border-r border-gray-200 dark:border-white/10 flex flex-col transition-colors duration-300 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">TRAFEGON</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className={isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-200 dark:border-white/10">
        <button className="w-full flex items-center gap-4 p-4 text-gray-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all duration-300 font-bold text-sm">
          <LogOut size={22} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};
