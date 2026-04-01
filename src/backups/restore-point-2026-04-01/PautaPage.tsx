// BACKUP OF /src/pages/PautaPage.tsx as of 2026-04-01
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { Plus, Filter, Search, MoreVertical, Clock, CheckCircle2, Trash2, Edit2, Calendar as CalendarIcon, User, Building2 } from 'lucide-react';
import { UNIT_COLORS, SOLICITANTE_COLORS, getContrastColor } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface PautaPageProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'posicao'>) => void;
  searchQuery: string;
}

export const PautaPage: React.FC<PautaPageProps> = ({ tasks, onUpdateTask, onDeleteTask, onAddTask, searchQuery }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Em andamento' | 'Concluído'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'posicao'>>({
    title: '',
    unidade: 'TODAS',
    solicitante: 'Fritz',
    status: 'Em andamento',
    entrega: new Date().toISOString().split('T')[0],
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.unidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.solicitante.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => a.posicao.localeCompare(b.posicao));
  }, [tasks, searchQuery, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTask);
    setIsModalOpen(false);
    setNewTask({
      title: '',
      unidade: 'TODAS',
      solicitante: 'Fritz',
      status: 'Em andamento',
      entrega: new Date().toISOString().split('T')[0],
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">PAUTA</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gerencie suas demandas e prazos</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
            {(['all', 'Em andamento', 'Concluído'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'Todos' : status}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              key={task.id}
              className="group bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 rounded-3xl p-5 flex items-center gap-6 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: UNIT_COLORS[task.unidade] || '#3B82F6' }} />
              
              <div className="flex flex-col items-center justify-center min-w-[48px] h-12 bg-gray-100 dark:bg-white/5 rounded-2xl">
                <span className="text-xs font-black text-gray-400 dark:text-gray-600">#{task.posicao || (index + 1).toString().padStart(2, '0')}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Building2 size={14} />
                    <span className="px-2 py-0.5 rounded-md" style={{ backgroundColor: `${UNIT_COLORS[task.unidade]}20`, color: UNIT_COLORS[task.unidade] }}>
                      {task.unidade}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <User size={14} />
                    <span className="px-2 py-0.5 rounded-md" style={{ backgroundColor: `${SOLICITANTE_COLORS[task.solicitante]}20`, color: SOLICITANTE_COLORS[task.solicitante] }}>
                      {task.solicitante}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <CalendarIcon size={14} />
                    <span>{formatDate(task.entrega)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateTask({ ...task, status: task.status === 'Concluído' ? 'Em andamento' : 'Concluído' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    task.status === 'Concluído'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                  }`}
                >
                  {task.status === 'Concluído' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  {task.status.toUpperCase()}
                </button>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Nova Tarefa */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0A0C1F] rounded-[40px] p-8 shadow-2xl border border-white/10"
            >
              <h3 className="text-3xl font-black tracking-tighter mb-6 text-gray-900 dark:text-white">NOVA TAREFA</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Título da Demanda</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white"
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Unidade</label>
                    <select
                      className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white appearance-none"
                      value={newTask.unidade}
                      onChange={e => setNewTask({ ...newTask, unidade: e.target.value })}
                    >
                      {Object.keys(UNIT_COLORS).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Solicitante</label>
                    <select
                      className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white appearance-none"
                      value={newTask.solicitante}
                      onChange={e => setNewTask({ ...newTask, solicitante: e.target.value })}
                    >
                      {Object.keys(SOLICITANTE_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Data de Entrega</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white"
                    value={newTask.entrega}
                    onChange={e => setNewTask({ ...newTask, entrega: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Criar Tarefa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
