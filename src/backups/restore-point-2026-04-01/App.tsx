// BACKUP OF /src/App.tsx as of 2026-04-01
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PautaPage } from './pages/PautaPage';
import { AniversariantesPage } from './pages/AniversariantesPage';
import { InformacoesPage } from './pages/InformacoesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Page, Task, Aniversariante, AIAction, UnitInfo } from './types';
import { loadTasks, saveTasks } from './lib/taskUtils';
import { loadAniversariantes, saveAniversariantes } from './lib/birthdayUtils';
import { loadUnitInfo, saveUnitInfo } from './lib/infoUtils';
import { createAutoSnapshot } from './lib/backupUtils';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('pauta');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [birthdays, setBirthdays] = useState<Aniversariante[]>([]);
  const [unitInfo, setUnitInfo] = useState<Record<string, UnitInfo>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load initial data
  useEffect(() => {
    setTasks(loadTasks());
    setBirthdays(loadAniversariantes());
    setUnitInfo(loadUnitInfo());
    
    // Check system preference for dark mode if not set
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (birthdays.length > 0) saveAniversariantes(birthdays);
  }, [birthdays]);

  useEffect(() => {
    if (Object.keys(unitInfo).length > 0) saveUnitInfo(unitInfo);
  }, [unitInfo]);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'posicao'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      posicao: (tasks.length + 1).toString().padStart(2, '0'),
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    createAutoSnapshot();
    showNotification('Tarefa adicionada com sucesso!');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    showNotification('Tarefa atualizada!');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    showNotification('Tarefa removida.', 'info');
  };

  const handleAddBirthday = (birthday: Omit<Aniversariante, 'id' | 'posicao'>) => {
    const newBirthday: Aniversariante = {
      ...birthday,
      id: Math.random().toString(36).substr(2, 9),
      posicao: (birthdays.length + 1).toString().padStart(2, '0'),
    };
    const updatedBirthdays = [...birthdays, newBirthday];
    setBirthdays(updatedBirthdays);
    createAutoSnapshot();
    showNotification('Aniversariante adicionada!');
  };

  const handleUpdateBirthday = (updated: Aniversariante) => {
    setBirthdays(birthdays.map(b => b.id === updated.id ? updated : b));
    showNotification('Dados atualizados!');
  };

  const handleDeleteBirthday = (id: string) => {
    setBirthdays(birthdays.filter(b => b.id !== id));
    showNotification('Aniversariante removida.', 'info');
  };

  const handleUpdateUnitInfo = (id: string, info: UnitInfo) => {
    setUnitInfo(prev => ({ ...prev, [id]: info }));
    showNotification('Informações da unidade atualizadas!');
  };

  const executeAction = (action: AIAction) => {
    switch (action.type) {
      case 'create_task':
        handleAddTask(action.payload);
        break;
      case 'update_task_status':
        const taskToUpdate = tasks.find(t => t.id === action.payload.id);
        if (taskToUpdate) {
          handleUpdateTask({ ...taskToUpdate, status: action.payload.status });
        }
        break;
      case 'create_birthday':
        handleAddBirthday(action.payload);
        break;
      case 'search':
        setSearchQuery(action.payload.query);
        break;
      default:
        showNotification('Comando não reconhecido ou não implementado.', 'error');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'pauta':
        return (
          <PautaPage 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            searchQuery={searchQuery}
          />
        );
      case 'aniversariantes':
        return (
          <AniversariantesPage 
            birthdays={birthdays}
            onUpdateBirthday={handleUpdateBirthday}
            onDeleteBirthday={handleDeleteBirthday}
            onAddBirthday={handleAddBirthday}
            searchQuery={searchQuery}
          />
        );
      case 'informacoes':
        return (
          <InformacoesPage 
            unitInfo={unitInfo}
            onUpdateUnitInfo={handleUpdateUnitInfo}
            searchQuery={searchQuery}
          />
        );
      case 'configuracoes':
        return <SettingsPage />;
      default:
        return <PautaPage tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onAddTask={handleAddTask} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#050714] text-[#050714] dark:text-white transition-colors duration-300">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onSearch={setSearchQuery} 
          onCommand={executeAction}
          onLocalAction={executeAction}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 border ${
              notification.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                : notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/50 text-red-500'
                : 'bg-blue-500/10 border-blue-500/50 text-blue-500'
            } backdrop-blur-md`}
          >
            {notification.type === 'success' && <CheckCircle2 size={20} />}
            {notification.type === 'error' && <AlertCircle size={20} />}
            {notification.type === 'info' && <Info size={20} />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
