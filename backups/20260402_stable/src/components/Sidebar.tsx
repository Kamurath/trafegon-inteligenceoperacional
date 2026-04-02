import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Info, Settings, Download, Upload, LogOut, ChevronRight, Github } from 'lucide-react';

type Page = 'pauta' | 'aniversariantes' | 'informacoes' | 'configuracoes';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onExport, onImport }) => {
  const menuItems = [
    { id: 'pauta', label: 'Pauta Semanal', icon: Calendar },
    { id: 'aniversariantes', label: 'Aniversariantes', icon: Users },
    { id: 'informacoes', label: 'Informa\u00e7\u00f5es', icon: Info },
    { id: 'configuracoes', label: 'Configura\u00e7\u00f5es', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#050714] text-white h-screen fixed left-0 top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">Tr\u00e1fegON</h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-blue-400 opacity-80">Management System</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                currentPage === item.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                currentPage === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'
              }`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              {currentPage === item.id && (
                <motion.div layoutId="active" className="ml-auto">
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Backup & Restore</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={onExport}
              className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <Download className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase tracking-widest">Exportar</span>
            </button>
            <label className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase tracking-widest">Importar</span>
              <input type="file" accept=".xml,.json" onChange={onImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sistema Online</span>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors">
            <Github className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
