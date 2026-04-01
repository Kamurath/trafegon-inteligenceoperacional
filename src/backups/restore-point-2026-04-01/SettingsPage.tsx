// BACKUP OF /src/pages/SettingsPage.tsx as of 2026-04-01
import React from 'react';
import { Settings, Shield, Database, Bell, Palette, Smartphone, Globe, Cloud, Download, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { exportData, createAutoSnapshot } from '../lib/backupUtils';
import { motion } from 'motion/react';

export const SettingsPage: React.FC = () => {
  const handleBackup = () => {
    const time = exportData();
    alert('Backup exportado com sucesso! Arquivo baixado.');
  };

  const handleManualSnapshot = () => {
    createAutoSnapshot();
    alert('Ponto de restauração criado com sucesso no armazenamento local.');
  };

  const SettingCard = ({ title, desc, icon: Icon, action, actionLabel, danger = false }: any) => (
    <div className="bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 p-8 rounded-[40px] flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-3xl ${danger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'} group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-md">{desc}</p>
        </div>
      </div>
      <button 
        onClick={action}
        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
          danger 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
            : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/20'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">CONFIGURAÇÕES</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Personalize sua experiência e gerencie seus dados</p>
        </div>
        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-3xl">
          <Settings size={32} />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Dados e Segurança</h3>
        <div className="grid grid-cols-1 gap-4">
          <SettingCard 
            title="Exportar Backup" 
            desc="Baixe uma cópia completa de todos os dados (Tarefas, Aniversariantes e Unidades) em formato JSON."
            icon={Download}
            action={handleBackup}
            actionLabel="Exportar Agora"
          />
          <SettingCard 
            title="Ponto de Restauração" 
            desc="Crie um snapshot manual do estado atual para recuperação rápida em caso de erros."
            icon={RefreshCw}
            action={handleManualSnapshot}
            actionLabel="Criar Snapshot"
          />
          <SettingCard 
            title="Importar Dados" 
            desc="Restaurar informações a partir de um arquivo de backup previamente exportado."
            icon={Upload}
            action={() => alert('Funcionalidade em desenvolvimento')}
            actionLabel="Selecionar Arquivo"
          />
          <SettingCard 
            title="Limpar Banco de Dados" 
            desc="CUIDADO: Esta ação apagará permanentemente todos os seus dados locais. Esta ação não pode ser desfeita."
            icon={Trash2}
            action={() => {
              if(confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação é irreversível.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            actionLabel="Resetar Sistema"
            danger
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Preferências do App</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 p-8 rounded-[40px] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Palette size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Personalização</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Modo Escuro Automático</span>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Compactar Listas</span>
                <div className="w-12 h-6 bg-gray-300 dark:bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 p-8 rounded-[40px] shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                <Bell size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Notificações</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Alertas de Prazo</span>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Sons do Sistema</span>
                <div className="w-12 h-6 bg-gray-300 dark:bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
