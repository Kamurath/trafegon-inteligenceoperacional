import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PautaPage } from './pages/PautaPage';
import { AniversariantesPage } from './pages/AniversariantesPage';
import { InformacoesPage } from './pages/InformacoesPage';
import { SettingsPage } from './pages/SettingsPage';
import { loadSettings } from './lib/settingsUtils';
import { exportData, importData, createAutoSnapshot } from './lib/backupUtils';
import { Calendar, Users, Info, Settings, Download, Upload, AlertCircle, X } from 'lucide-react';

type Page = 'pauta' | 'aniversariantes' | 'informacoes' | 'configuracoes';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('pauta');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const settings = loadSettings();
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Auto snapshot every 10 minutes
    const snapshotInterval = setInterval(createAutoSnapshot, 10 * 60 * 1000);
    
    // Check for backup reminder
    const lastBackup = localStorage.getItem('trafegon_last_backup');
    const today = new Date().toISOString().split('T')[0];
    if (lastBackup !== today) {
      setShowBackupReminder(true);
    }

    return () => clearInterval(snapshotInterval);
  }, []);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSearchQuery('');
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const success = await importData(file);
      setIsImporting(false);
      setImportStatus(success ? 'success' : 'error');
      if (success) {
        handleDataChange();
        setTimeout(() => setImportStatus(null), 3000);
      }
    }
  };

  const handleExport = () => {
    exportData();
    localStorage.setItem('trafegon_last_backup', new Date().toISOString().split('T')[0]);
    setShowBackupReminder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050714] transition-colors">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          onDataChange={handleDataChange}
        />
        
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + refreshKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentPage === 'pauta' && <PautaPage searchQuery={searchQuery} refreshKey={refreshKey} />}
              {currentPage === 'aniversariantes' && <AniversariantesPage searchQuery={searchQuery} refreshKey={refreshKey} />}
              {currentPage === 'informacoes' && <InformacoesPage refreshKey={refreshKey} />}
              {currentPage === 'configuracoes' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => handlePageChange('pauta')}
            className={`flex flex-col items-center gap-1 ${currentPage === 'pauta' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Pauta</span>
          </button>
          <button 
            onClick={() => handlePageChange('aniversariantes')}
            className={`flex flex-col items-center gap-1 ${currentPage === 'aniversariantes' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">N\u00edver</span>
          </button>
          <button 
            onClick={() => handlePageChange('informacoes')}
            className={`flex flex-col items-center gap-1 ${currentPage === 'informacoes' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Info className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Info</span>
          </button>
          <button 
            onClick={() => handlePageChange('configuracoes')}
            className={`flex flex-col items-center gap-1 ${currentPage === 'configuracoes' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Config</span>
          </button>
        </nav>
      </div>

      {/* Backup Reminder */}
      <AnimatePresence>
        {showBackupReminder && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50 max-w-sm w-full"
          >
            <div className="bg-[#050714] dark:bg-white text-white dark:text-[#050714] p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-4">
              <div className="p-2 bg-blue-500 rounded-xl">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">Seguran\u00e7a de Dados</h4>
                <p className="text-xs opacity-70 mt-1">Voc\u00ea ainda n\u00e3o realizou o backup de hoje. Exporte seus dados para garantir que n\u00e3o perca nada.</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleExport}
                    className="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Fazer Backup Agora
                  </button>
                  <button 
                    onClick={() => setShowBackupReminder(false)}
                    className="px-4 py-1.5 bg-white/10 dark:bg-[#050714]/10 text-white dark:text-[#050714] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all"
                  >
                    Depois
                  </button>
                </div>
              </div>
              <button onClick={() => setShowBackupReminder(false)} className="opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Status Toast */}
      <AnimatePresence>
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`px-6 py-3 rounded-full shadow-xl text-white text-sm font-bold flex items-center gap-2 ${
              importStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {importStatus === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {importStatus === 'success' ? 'Dados importados com sucesso!' : 'Erro ao importar dados.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
