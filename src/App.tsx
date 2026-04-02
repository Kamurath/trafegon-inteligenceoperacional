import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PautaPage } from './pages/PautaPage';
import { AniversariantesPage } from './pages/AniversariantesPage';
import { InformacoesPage } from './pages/InformacoesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Page, AIAction } from './types';
import { interpretCommand } from './lib/aiCommand';
import { loadTasks, saveTasks } from './lib/taskUtils';
import { loadAniversariantes, saveAniversariantes } from './lib/birthdayUtils';
import { loadUnitInfo, saveUnitInfo } from './lib/infoUtils';
import { createAutoSnapshot, checkManualBackupNeeded, exportData, importData } from './lib/backupUtils';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Download, Cake, X as CloseIcon } from 'lucide-react';

function BirthdayNotification({ refreshKey }: { refreshKey: number }) {
  const [birthdaysToday, setBirthdaysToday] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const birthdays = loadAniversariantes();
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    const todayBirthdays = birthdays.filter(b => {
      const bDate = new Date(b.data + 'T00:00:00');
      return bDate.getMonth() === todayMonth && bDate.getDate() === todayDay;
    });

    if (todayBirthdays.length > 0) {
      const todayStr = today.toISOString().split('T')[0];
      const dismissed = localStorage.getItem(`dismissed_birthday_${todayStr}`);
      if (!dismissed) {
        setBirthdaysToday(todayBirthdays);
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [refreshKey]);

  const handleDismiss = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dismissed_birthday_${todayStr}`, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
          <Cake className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-pink-900">
            {birthdaysToday.length === 1 
              ? `Hoje é aniversário de ${birthdaysToday[0].name}!` 
              : `Hoje é aniversário de ${birthdaysToday.length} aniversariantes!`}
          </h4>
          <p className="text-xs text-pink-700">
            {birthdaysToday.length === 1 
              ? 'Não esqueça de dar os parabéns!' 
              : birthdaysToday.map(b => b.name).join(', ')}
          </p>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="p-2 hover:bg-pink-100 rounded-full text-pink-400 transition-colors"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('pauta');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('trafegon_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    // Force reset to v5 if not already done to ensure the new real task list is loaded
    if (!localStorage.getItem('pauta_tasks_v5_reset')) {
      localStorage.removeItem('pauta_tasks_v3');
      localStorage.removeItem('pauta_tasks_v4');
      localStorage.removeItem('pauta_tasks_v2');
      localStorage.setItem('pauta_tasks_v5_reset', 'true');
      setRefreshKey(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trafegon_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trafegon_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setShowBackupReminder(checkManualBackupNeeded());
  }, [refreshKey]);

  useEffect(() => {
    if (refreshKey > 0) {
      createAutoSnapshot();
    }
  }, [refreshKey]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDataChanged = (message?: string) => {
    setRefreshKey(prev => prev + 1);
    if (message) {
      showFeedback(message);
    }
  };

  const handleCommand = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const action = await interpretCommand(text, activePage);
      
      if (action.type === 'search') {
        setSearchQuery(action.payload.query);
        showFeedback('Busca aplicada');
      } else {
        executeAction(action);
      }
    } catch (error) {
      console.error("Command execution error:", error);
      setSearchQuery(text); // Fallback to search
      showFeedback('Erro ao processar comando, aplicando busca', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = (action: AIAction) => {
    try {
      switch (action.type) {
        case 'create_task': {
          const tasks = loadTasks();
          tasks.push({
            ...action.payload,
            id: Math.random().toString(36).substr(2, 9),
            status: action.payload.status || 'Em andamento'
          });
          saveTasks(tasks);
          showFeedback('Tarefa criada com sucesso');
          break;
        }
        case 'update_task_status': {
          const tasks = loadTasks();
          let task = tasks.find(t => t.id === action.payload.taskId || t.posicao === action.payload.taskId);
          
          // If not found by ID/posicao, try by index (1-based)
          if (!task && /^\d+$/.test(action.payload.taskId)) {
            const index = parseInt(action.payload.taskId, 10) - 1;
            if (index >= 0 && index < tasks.length) {
              task = tasks[index];
            }
          }

          if (task) {
            task.status = action.payload.status;
            saveTasks(tasks);
            showFeedback('Status da tarefa atualizado');
          } else {
            throw new Error('Tarefa não encontrada');
          }
          break;
        }
        case 'delete_task': {
          let tasks = loadTasks();
          const taskId = action.payload.taskId;
          
          let targetId = taskId;
          // If taskId looks like a position, find the actual ID
          if (/^\d+$/.test(taskId)) {
            const index = parseInt(taskId, 10) - 1;
            if (index >= 0 && index < tasks.length && !tasks.find(t => t.id === taskId)) {
              targetId = tasks[index].id;
            }
          }

          tasks = tasks.filter(t => t.id !== targetId && t.posicao !== targetId);
          saveTasks(tasks);
          showFeedback('Tarefa excluída');
          break;
        }
        case 'create_birthday': {
          const birthdays = loadAniversariantes();
          birthdays.push({
            ...action.payload,
            id: Math.random().toString(36).substr(2, 9),
            status: action.payload.status || 'Aguardando'
          });
          saveAniversariantes(birthdays);
          showFeedback('Aniversariante adicionado');
          break;
        }
        case 'update_birthday_status': {
          const birthdays = loadAniversariantes();
          const bday = birthdays.find(b => b.id === action.payload.birthdayId || b.posicao === action.payload.birthdayId);
          if (bday) {
            bday.status = action.payload.status;
            if (bday.status === 'Aguardando') {
              const date = new Date(bday.data + 'T00:00:00');
              date.setFullYear(date.getFullYear() + 1);
              bday.data = date.toISOString().split('T')[0];
            }
            saveAniversariantes(birthdays);
            showFeedback('Status do aniversariante atualizado');
          } else {
            throw new Error('Aniversariante não encontrado');
          }
          break;
        }
        case 'delete_birthday': {
          let birthdays = loadAniversariantes();
          birthdays = birthdays.filter(b => b.id !== action.payload.birthdayId && b.posicao !== action.payload.birthdayId);
          saveAniversariantes(birthdays);
          showFeedback('Aniversariante excluído');
          break;
        }
        case 'update_unit_info': {
          const info = loadUnitInfo();
          if (info[action.payload.unitId]) {
            (info[action.payload.unitId] as any)[action.payload.field] = action.payload.value;
            saveUnitInfo(info);
            showFeedback('Informações da unidade atualizadas');
          } else {
            throw new Error('Unidade não encontrada');
          }
          break;
        }
        default:
          setSearchQuery(JSON.stringify(action.payload));
      }
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      showFeedback(error.message || 'Erro ao executar ação', 'error');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'pauta':
        return <PautaPage searchQuery={searchQuery} refreshKey={refreshKey} />;
      case 'aniversariantes':
        return <AniversariantesPage searchQuery={searchQuery} refreshKey={refreshKey} />;
      case 'informacoes':
        return <InformacoesPage refreshKey={refreshKey} />;
      case 'configuracoes':
        return <SettingsPage />;
      default:
        return <PautaPage searchQuery={searchQuery} refreshKey={refreshKey} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c1b] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
        onDataChanged={handleDataChanged}
      />
      
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen">
        <Header 
          activePage={activePage} 
          onPageChange={setActivePage}
          onSearch={setSearchQuery} 
          onCommand={handleCommand}
          onLocalAction={executeAction}
          isProcessing={isProcessing}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
        
        <main className="p-3 lg:p-8 max-w-7xl mx-auto w-full flex-1 relative">
          <AnimatePresence>
            <BirthdayNotification refreshKey={refreshKey} />
          </AnimatePresence>
          
          <AnimatePresence>
            {showBackupReminder && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-2 bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center gap-3 shadow-sm lg:rounded-2xl lg:p-4 lg:mb-6 lg:justify-between"
              >
                <button
                  onClick={() => {
                    exportData();
                    setRefreshKey(prev => prev + 1);
                    showFeedback('Backup exportado com sucesso');
                  }}
                  className="px-2 py-1 lg:px-4 lg:py-2 bg-amber-600 text-white rounded-lg text-[9px] lg:text-xs font-black uppercase tracking-wider hover:bg-amber-700 transition-colors shadow-sm order-1"
                >
                  Backup
                </button>
                <div className="flex items-center gap-1.5 lg:gap-3 order-2">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                  </div>
                  <h4 className="text-[10px] lg:text-sm font-bold text-amber-900">Backup manual pendente</h4>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {renderPage()}

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 20, x: '-50%' }}
                className={`fixed bottom-8 left-1/2 px-6 py-3 rounded-full shadow-lg text-white text-sm font-bold z-50 ${
                  feedback.type === 'success' ? 'bg-[#050714]' : 'bg-red-500'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="p-4 lg:p-8 border-t border-gray-100 bg-white/50">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-center items-start lg:items-center gap-4">
            <div className="flex lg:hidden gap-2 mb-2">
              <button 
                onClick={() => {
                  exportData();
                  setRefreshKey(prev => prev + 1);
                }}
                className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-gray-50 text-gray-500 rounded-md active:scale-95 transition-all border border-gray-100"
              >
                exportar xml
              </button>
              <button 
                onClick={() => document.getElementById('footer-import-xml')?.click()}
                className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-gray-50 text-gray-500 rounded-md active:scale-95 transition-all border border-gray-100"
              >
                importar xml
              </button>
              <input 
                id="footer-import-xml"
                type="file"
                accept=".json,.xml"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const success = await importData(file);
                    if (success) {
                      setFeedback({ message: 'Dados importados com sucesso!', type: 'success' });
                      setRefreshKey(prev => prev + 1);
                    } else {
                      setFeedback({ message: 'Falha ao importar dados.', type: 'error' });
                    }
                  }
                }}
              />
            </div>
            <p className="text-[7px] lg:text-xs text-gray-400 text-left lg:text-center w-full">
              <span className="lg:hidden">&copy; 2026 Desenvolvido por TráfegON. Todos os direitos reservados.</span>
              <span className="hidden lg:inline">&copy; 2026 Dashboard Pessoal. Todos os direitos reservados.</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
