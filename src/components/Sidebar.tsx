import React, { useRef } from 'react';
import { LayoutGrid, Calendar, MessageSquare, Settings, Download, Upload, CheckSquare, PartyPopper } from 'lucide-react';
import { Page } from '../types';
import { motion } from 'motion/react';
import { exportData, importData } from '../lib/backupUtils';

interface SidebarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  onDataChanged?: (message?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, onDataChanged }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuItems = [
    { id: 'pauta' as Page, label: 'Pauta', icon: CheckSquare },
    { id: 'aniversariantes' as Page, label: 'Aniversariantes', icon: PartyPopper },
    { id: 'informacoes' as Page, label: 'Informações', icon: MessageSquare },
  ];

  const handleExport = () => {
    exportData();
    onDataChanged?.('Backup exportado com sucesso');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm('Deseja realmente importar este arquivo? Isso substituirá todos os dados atuais.')) {
        const success = await importData(file);
        if (success) {
          onDataChanged?.('Dados restaurados com sucesso');
        } else {
          alert('Erro ao importar arquivo. Verifique se o formato está correto.');
        }
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <aside className="hidden lg:flex w-64 h-screen bg-[#050714] flex-col fixed left-0 top-0 z-20 text-white">
      <div className="p-8">
        <div className="mb-12">
          <div className="flex items-center gap-0.5">
            <span className="text-3xl font-bold tracking-tighter">tráfeg</span>
            <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-[9px] font-black mt-1">on</div>
          </div>
          <p className="text-[9px] text-gray-400 mt-1 font-medium tracking-tight opacity-70">
            ative o <span className="text-white border border-gray-600 rounded-full px-1.5 py-0.5 text-[7px] font-bold mx-0.5">modo on</span> para o seu negócio.
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                  isActive
                    ? 'text-[#050714] bg-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-[#050714] rounded-r-full ml-[-2px]" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#050714]' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-2.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        <button 
          onClick={() => onPageChange('configuracoes')}
          className={`flex items-center gap-2.5 transition-colors text-[10px] font-medium w-full ${
            activePage === 'configuracoes' ? 'text-white opacity-100' : 'text-gray-500 hover:text-white opacity-60 hover:opacity-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Configurações
        </button>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors text-[10px] font-medium w-full opacity-60 hover:opacity-100"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar XML
        </button>
        <button 
          onClick={handleImportClick}
          className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors text-[10px] font-medium w-full opacity-60 hover:opacity-100"
        >
          <Upload className="w-3.5 h-3.5" />
          Importar XML
        </button>
      </div>
    </aside>
  );
};
