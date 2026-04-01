import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Task, AppSettings } from '../types';
import { loadTasks, saveTasks } from '../lib/taskUtils';
import { loadSettings } from '../lib/settingsUtils';
import { X, Trash2, Edit2, Check, GripVertical, Plus, Filter, MoreVertical, ChevronRight, ChevronLeft } from 'lucide-react';
import { getContrastColor } from '../constants';

interface PautaPageProps {
  searchQuery: string;
  refreshKey?: number;
}

export const PautaPage: React.FC<PautaPageProps> = ({ searchQuery, refreshKey }) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks());
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [filter, setFilter] = useState<string>('Em andamento');
  const [monthFilter, setMonthFilter] = useState<string>('Todos');
  const [extraMonths, setExtraMonths] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tempTask, setTempTask] = useState<Task | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    
    let date: Date;
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
      date = new Date(dateStr + 'T00:00:00');
    }

    if (isNaN(date.getTime())) return dateStr;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    let datePart = '';
    if (compareDate.getTime() === today.getTime()) {
      datePart = 'HOJE';
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      datePart = 'AMANHÃ';
    } else {
      datePart = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }

    if (dateStr.includes('T') && dateStr.length > 10) {
      const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${datePart} às ${timePart}`;
    }
    
    return datePart;
  };

  const getDeliveryStyle = (dateStr: string, status: string) => {
    if (!dateStr) return 'text-gray-500';
    
    const now = new Date();
    let deliveryDate: Date;
    if (dateStr.includes('T')) {
      deliveryDate = new Date(dateStr);
    } else {
      deliveryDate = new Date(dateStr + 'T00:00:00');
    }

    if (isNaN(deliveryDate.getTime())) return 'text-gray-500';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const compareDate = new Date(deliveryDate);
    compareDate.setHours(0, 0, 0, 0);
    
    const isToday = compareDate.getTime() === today.getTime();
    const isTomorrow = compareDate.getTime() === tomorrow.getTime();
    
    let isOverdue = false;
    if (status !== 'Concluído') {
      if (dateStr.includes('T') && dateStr.length > 10) {
        // Has time, compare exactly
        isOverdue = now > deliveryDate;
      } else {
        // No time, overdue only if it's past today
        isOverdue = compareDate.getTime() < today.getTime();
      }
    }

    if (status === 'Concluído') return 'bg-blue-100 text-blue-600';
    if (isOverdue) return 'bg-red-600 text-white';
    if (isToday) return 'bg-orange-500 text-white';
    if (isTomorrow) return 'bg-[#050714] text-white';
    
    return 'bg-gray-50 text-gray-500';
  };

  // Form state
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'posicao'>>({
    title: '',
    unidade: '',
    solicitante: '',
    status: 'Em andamento',
    entrega: '',
    originalEntrega: '',
  });

  useEffect(() => {
    setTasks(loadTasks());
    
    const handleSettingsChange = () => {
      setSettings(loadSettings());
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, [refreshKey]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const getUnitColor = (name: string) => settings.unidades.find(u => u.name === name)?.color || '#FFFFFF';
  const getSolicitanteColor = (name: string) => settings.solicitantes.find(s => s.name === name)?.color || '#FFFFFF';
  const getStatusColor = (name: string) => settings.statusPauta.find(s => s.name === name)?.color || '#FDBA74';

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesFilter = filter === 'Todos' || task.status === filter;
      
      // Month Filter logic
      let matchesMonth = true;
      if (monthFilter !== 'Todos' && task.entrega) {
        const taskDate = new Date(task.entrega);
        if (!isNaN(taskDate.getTime())) {
          const month = (taskDate.getMonth() + 1).toString().padStart(2, '0');
          const year = taskDate.getFullYear();
          matchesMonth = `${month}/${year}` === monthFilter;
        }
      }

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        task.unidade.toLowerCase().includes(searchLower) ||
        task.solicitante.toLowerCase().includes(searchLower) ||
        task.status.toLowerCase().includes(searchLower);
      return matchesFilter && matchesMonth && matchesSearch;
    });

    if (filter === 'Concluído') {
      return [...filtered].sort((a, b) => {
        const dateA = new Date(a.entrega).getTime();
        const dateB = new Date(b.entrega).getTime();
        return dateB - dateA; // Newest first
      });
    }

    return filtered;
  }, [tasks, filter, searchQuery]);

  const handleReorder = (reorderedFiltered: Task[]) => {
    const newTasks = [...tasks];
    const indices = filteredTasks.map(ft => tasks.findIndex(t => t.id === ft.id));
    
    reorderedFiltered.forEach((item, i) => {
      newTasks[indices[i]] = item;
    });
    
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      unidade: '',
      solicitante: '',
      status: 'Em andamento',
      entrega: '',
      originalEntrega: '',
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingRowId(task.id);
    setTempTask({ ...task });
    setIsModalOpen(false);
  };

  const handleModalEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      unidade: task.unidade,
      solicitante: task.solicitante,
      status: task.status,
      entrega: task.entrega,
      originalEntrega: task.originalEntrega || '',
    });
    setIsModalOpen(true);
  };

  const handleInlineChange = (field: keyof Task, value: string) => {
    if (tempTask) {
      let updated = { ...tempTask, [field]: value };
      
      // If status changed to Concluído, update entrega with current timestamp
      if (field === 'status' && value === 'Concluído' && tempTask.status !== 'Concluído') {
        updated.originalEntrega = tempTask.entrega;
        updated.entrega = new Date().toISOString();
      } else if (field === 'status' && value === 'Em andamento' && tempTask.status === 'Concluído') {
        if (tempTask.originalEntrega) {
          updated.entrega = tempTask.originalEntrega;
        }
      }
      
      setTempTask(updated);
      // Optional: auto-save on status change if we want it immediate
      if (field === 'status') {
        setTasks(tasks.map(t => t.id === tempTask.id ? updated : t));
      }
    }
  };

  const saveInlineEdit = () => {
    if (tempTask && editingRowId) {
      setTasks(tasks.map((t) => (t.id === editingRowId ? tempTask : t)));
      setEditingRowId(null);
      setTempTask(null);
    }
  };

  const cancelInlineEdit = () => {
    setEditingRowId(null);
    setTempTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    setDeletingId(null);
  };

  const handleToggleStatus = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'Concluído' ? 'Em andamento' : 'Concluído';
        let newEntrega = t.entrega;
        let newOriginalEntrega = t.originalEntrega;

        if (newStatus === 'Concluído') {
          newOriginalEntrega = t.entrega;
          newEntrega = new Date().toISOString();
        } else if (newStatus === 'Em andamento' && t.originalEntrega) {
          newEntrega = t.originalEntrega;
        }
        
        return { ...t, status: newStatus as any, entrega: newEntrega, originalEntrega: newOriginalEntrega };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalFormData = { ...formData };
    
    // If status is Concluído and it's a new task or status changed to Concluído
    if (finalFormData.status === 'Concluído' && (!editingTask || editingTask.status !== 'Concluído')) {
      finalFormData.originalEntrega = formData.entrega;
      finalFormData.entrega = new Date().toISOString();
    } else if (finalFormData.status === 'Em andamento' && editingTask && editingTask.status === 'Concluído') {
      if (formData.originalEntrega) {
        finalFormData.entrega = formData.originalEntrega;
      }
    }

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...finalFormData, id: t.id, posicao: t.posicao } : t)));
    } else {
      const newTask: Task = {
        ...finalFormData,
        id: Math.random().toString(36).substr(2, 9),
        posicao: '', // Will be calculated on display
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 px-2"
    >
      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {/* 1. Em andamento */}
        {settings.statusPauta.filter(s => s.name === 'Em andamento').map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.name)}
            className={`px-6 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
              filter === s.name
                ? 'shadow-md'
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
            style={filter === s.name ? { backgroundColor: s.color, color: getContrastColor(s.color) } : {}}
          >
            {s.name}
          </button>
        ))}

        {/* 2. Concluído */}
        {settings.statusPauta.filter(s => s.name === 'Concluído').map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.name)}
            className={`px-6 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
              filter === s.name
                ? 'shadow-md'
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
            style={filter === s.name ? { backgroundColor: s.color, color: getContrastColor(s.color) } : {}}
          >
            {s.name}
          </button>
        ))}

        {/* 3. Todos */}
        <button
          onClick={() => setFilter('Todos')}
          className={`px-6 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
            filter === 'Todos'
              ? 'bg-[#050714] text-white'
              : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>

        {/* 4. Mês/Ano Filter */}
        <div className="relative">
          <select
            value={monthFilter}
            onChange={(e) => {
              if (e.target.value === 'ADD_NEXT') {
                setExtraMonths(prev => prev + 1);
              } else {
                setMonthFilter(e.target.value);
              }
            }}
            className={`pl-4 pr-8 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all appearance-none outline-none cursor-pointer border ${
              monthFilter !== 'Todos'
                ? 'bg-[#050714] text-white border-[#050714]'
                : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <option value="Todos">Mês/Ano</option>
            <option value="ADD_NEXT" className="text-blue-600 font-bold">+ Adicionar próximo mês</option>
            {(() => {
              const options = [];
              const startDate = new Date(2026, 3, 1); // April 2026
              
              // Calculate end date: max of (Now, all task dates) + extraMonths
              let endDate = new Date();
              tasks.forEach(t => {
                if (t.entrega) {
                  const d = new Date(t.entrega);
                  if (!isNaN(d.getTime()) && d > endDate) {
                    endDate = new Date(d);
                  }
                }
              });
              
              if (extraMonths > 0) {
                endDate.setMonth(endDate.getMonth() + extraMonths);
              }
              
              let current = new Date(startDate);
              // Normalize to start of month for comparison
              const endLimit = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
              
              while (new Date(current.getFullYear(), current.getMonth(), 1) <= endLimit) {
                const m = (current.getMonth() + 1).toString().padStart(2, '0');
                const y = current.getFullYear();
                const label = current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                const value = `${m}/${y}`;
                options.push(<option key={value} value={value} className="text-black">{label}</option>);
                current.setMonth(current.getMonth() + 1);
              }
              return options.reverse(); // Newest first
            })()}
          </select>
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            monthFilter !== 'Todos' ? 'text-white' : 'text-gray-400'
          }`}>
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table / Mobile Cards */}
      <div className="w-full">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[40px_3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.4fr_80px] gap-2 mb-2 px-5 py-2 bg-[#050714] dark:bg-black rounded-t-xl text-white text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center justify-center">
            <GripVertical className="w-3 h-3 opacity-0" />
          </div>
          <div>Tarefa</div>
          <div className="text-center">Unidade</div>
          <div className="text-center">Solicitante</div>
          <div className="text-center">Status</div>
          <div className="text-center">Entrega</div>
          <div className="text-center">Posição</div>
          <div className="text-center">Ações</div>
        </div>

        {/* Rows */}
        <Reorder.Group axis="y" values={filteredTasks} onReorder={handleReorder} className="space-y-4 lg:space-y-2">
          {filteredTasks.map((task, index) => {
            const isEditing = editingRowId === task.id;
            const currentTask = isEditing && tempTask ? tempTask : task;

            return (
              <Reorder.Item 
                key={task.id} 
                value={task}
                className={`flex flex-col lg:grid lg:grid-cols-[40px_3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.4fr_80px] gap-2 items-stretch group transition-all p-0 lg:p-0 bg-white dark:bg-gray-900 lg:bg-transparent rounded-2xl lg:rounded-none border lg:border-none border-gray-100 dark:border-gray-800 shadow-sm lg:shadow-none overflow-hidden ${
                  isEditing ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20' : ''
                }`}
              >
                {/* Desktop Drag Handle */}
                <div className="hidden lg:flex items-center justify-center bg-white/5 dark:bg-white/10 border border-gray-100 dark:border-gray-800 rounded-l-xl cursor-grab active:cursor-grabbing group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors">
                  <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                </div>

                {/* Mobile Header (Position and Actions) */}
                <div className="flex lg:hidden items-center justify-between p-4 bg-[#050714] dark:bg-black text-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#3B82F6] text-white text-[10px] font-black px-2 py-0.5 rounded-sm">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <span className="text-sm font-bold truncate max-w-[200px]">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModalEdit(task)}
                      className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(task.id)}
                      className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Desktop Task Title (Hidden on Mobile) */}
                <div className="hidden lg:flex bg-[#050714] dark:bg-black text-white px-4 py-3 text-sm font-medium items-center min-w-0 rounded-xl lg:rounded-none">
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={currentTask.title}
                      onChange={(e) => handleInlineChange('title', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit()}
                      className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <div className="cursor-text w-full break-words" onClick={() => handleEditTask(task)}>
                      {task.title}
                    </div>
                  )}
                </div>
                
                {/* Content Area */}
                <div className="p-4 lg:p-0 lg:contents">
                  <div className="grid grid-cols-1 lg:contents gap-3">
                    {/* Mobile Details List */}
                    <div className="lg:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Unidade</span>
                        <div 
                          className="px-3 py-1 rounded-full text-[10px] font-bold"
                          style={{ 
                            backgroundColor: getUnitColor(currentTask.unidade),
                            color: getContrastColor(getUnitColor(currentTask.unidade))
                          }}
                        >
                          {currentTask.unidade}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Solicitante</span>
                        <div 
                          className="px-3 py-1 rounded-full text-[10px] font-bold"
                          style={{ 
                            backgroundColor: getSolicitanteColor(currentTask.solicitante),
                            color: getContrastColor(getSolicitanteColor(currentTask.solicitante))
                          }}
                        >
                          {currentTask.solicitante}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Status</span>
                        <button
                          onClick={() => handleToggleStatus(task.id)}
                          className="px-3 py-1 rounded-full text-[10px] font-bold transition-all"
                          style={{ 
                            backgroundColor: getStatusColor(task.status),
                            color: getContrastColor(getStatusColor(task.status))
                          }}
                        >
                          {task.status}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Entrega</span>
                        <div 
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            getDeliveryStyle(task.entrega, task.status)
                          }`}
                        >
                          {formatDate(task.entrega)}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Cells (Hidden on Mobile) */}
                    <div 
                      className="hidden lg:flex border border-gray-100 dark:border-gray-800 items-center justify-center text-[10px] lg:text-xs font-bold rounded-lg py-2 px-2"
                      style={{ 
                        backgroundColor: getUnitColor(currentTask.unidade),
                        color: getContrastColor(getUnitColor(currentTask.unidade))
                      }}
                    >
                      {isEditing ? (
                        <select
                          value={currentTask.unidade}
                          onChange={(e) => handleInlineChange('unidade', e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-center cursor-pointer"
                          style={{ color: 'inherit' }}
                        >
                          {settings.unidades.map(u => <option key={u.id} value={u.name} className="text-black">{u.name}</option>)}
                        </select>
                      ) : (
                        <div className="cursor-pointer w-full text-center" onClick={() => handleEditTask(task)}>
                          {task.unidade}
                        </div>
                      )}
                    </div>

                    <div 
                      className="hidden lg:flex border border-gray-100 dark:border-gray-800 items-center justify-center text-[10px] lg:text-xs font-medium rounded-lg py-2 px-2"
                      style={{ 
                        backgroundColor: getSolicitanteColor(currentTask.solicitante),
                        color: getContrastColor(getSolicitanteColor(currentTask.solicitante))
                      }}
                    >
                      {isEditing ? (
                        <select
                          value={currentTask.solicitante}
                          onChange={(e) => handleInlineChange('solicitante', e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-center cursor-pointer"
                          style={{ color: 'inherit' }}
                        >
                          {settings.solicitantes.map(s => <option key={s.id} value={s.name} className="text-black">{s.name}</option>)}
                        </select>
                      ) : (
                        <div className="cursor-text w-full text-center" onClick={() => handleEditTask(task)}>
                          {task.solicitante}
                        </div>
                      )}
                    </div>

                    <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center p-1 rounded-lg">
                      {isEditing ? (
                        <select
                          value={currentTask.status}
                          onChange={(e) => handleInlineChange('status', e.target.value)}
                          className="w-full py-1.5 rounded-lg text-[10px] font-bold text-center appearance-none cursor-pointer outline-none"
                          style={{ 
                            backgroundColor: getStatusColor(currentTask.status),
                            color: getContrastColor(getStatusColor(currentTask.status))
                          }}
                        >
                          {settings.statusPauta.map(s => <option key={s.id} value={s.name} className="text-black">{s.name}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(task.id)}
                          className="w-full py-1.5 rounded-lg text-[10px] font-bold text-center transition-colors"
                          style={{ 
                            backgroundColor: getStatusColor(task.status),
                            color: getContrastColor(getStatusColor(task.status))
                          }}
                        >
                          {task.status}
                        </button>
                      )}
                    </div>

                    <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center p-1 rounded-lg gap-1">
                      {isEditing ? (
                        <>
                          <input
                            type="date"
                            value={currentTask.entrega.split('T')[0]}
                            onChange={(e) => {
                              const time = currentTask.entrega.includes('T') ? currentTask.entrega.split('T')[1] : '';
                              handleInlineChange('entrega', e.target.value + (time ? 'T' + time : ''));
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit()}
                            className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center bg-transparent border-none outline-none ${
                              getDeliveryStyle(currentTask.entrega, currentTask.status)
                            }`}
                          />
                        </>
                      ) : (
                        <div 
                          onClick={() => handleEditTask(task)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center cursor-text ${
                            getDeliveryStyle(task.entrega, task.status)
                          }`}
                        >
                          {formatDate(task.entrega)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Position */}
                  <div className="hidden lg:flex bg-[#3B82F6] text-white items-center justify-center text-xs font-bold py-1 px-1">
                    <div className="w-full text-center">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center gap-2 rounded-r-xl py-3 px-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveInlineEdit}
                          className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                          title="Salvar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelInlineEdit}
                          className="p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleModalEdit(task)}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deletingId === task.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                              title="Confirmar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(task.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Deletion Confirmation */}
                {deletingId === task.id && (
                  <div className="lg:hidden p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">Excluir tarefa?</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteTask(task.id)} className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg">Sim, excluir</button>
                        <button onClick={() => setDeletingId(null)} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-lg">Não</button>
                      </div>
                    </div>
                  </div>
                )}
              </Reorder.Item>
            );
          })}

          {/* Add Task Button Row */}
          <div className="hidden lg:grid grid-cols-[40px_3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.4fr_80px] gap-2 items-stretch">
            <div className="bg-white/5 border border-gray-100 rounded-l-xl flex items-center justify-center">
              <GripVertical className="w-4 h-4 text-gray-200" />
            </div>
            <button
              onClick={handleAddTask}
              className="bg-[#050714] text-white px-6 py-3 text-sm font-medium text-left hover:bg-gray-900 transition-colors"
            >
              + Adicionar Tarefa
            </button>
            <div className="bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-300 py-3">-</div>
            <div className="bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-300 py-3">-</div>
            <div className="bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-300 py-3">-</div>
            <div className="bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-300 py-3">-</div>
            <div className="bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold opacity-50 py-3">
              {(filteredTasks.length + 1).toString().padStart(2, '0')}
            </div>
            <div className="bg-white border border-gray-100 flex items-center justify-center rounded-r-xl py-3">-</div>
          </div>

          <button
            onClick={handleAddTask}
            className="lg:hidden w-full py-4 bg-[#050714] dark:bg-white dark:text-[#050714] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            + Nova Tarefa
          </button>
        </Reorder.Group>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-[#050714] p-6 text-white flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:opacity-70 transition-opacity">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Tarefa</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="Nome da tarefa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Unidade</label>
                    <select
                      required
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    >
                      <option value="">Selecione uma unidade</option>
                      {settings.unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Solicitante</label>
                    <select
                      required
                      value={formData.solicitante}
                      onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    >
                      <option value="">Selecione um solicitante</option>
                      {settings.solicitantes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Entrega</label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="date"
                        value={formData.entrega.split('T')[0]}
                        onChange={(e) => {
                          const time = formData.entrega.includes('T') ? formData.entrega.split('T')[1] : '';
                          setFormData({ ...formData, entrega: e.target.value + (time ? 'T' + time : '') });
                        }}
                        className={`flex-1 px-4 py-2 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold ${
                          getDeliveryStyle(formData.entrega, formData.status)
                        }`}
                      />
                      <input
                        type="time"
                        value={formData.entrega.includes('T') ? formData.entrega.split('T')[1].substring(0, 5) : ''}
                        onChange={(e) => {
                          const date = formData.entrega.split('T')[0] || new Date().toISOString().split('T')[0];
                          setFormData({ ...formData, entrega: date + (e.target.value ? 'T' + e.target.value : '') });
                        }}
                        className={`w-32 px-4 py-2 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold ${
                          getDeliveryStyle(formData.entrega, formData.status)
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.statusPauta.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          const newStatus = s.name;
                          let newEntrega = formData.entrega;
                          let newOriginalEntrega = formData.originalEntrega;
                          
                          if (newStatus === 'Concluído' && formData.status !== 'Concluído') {
                            newOriginalEntrega = formData.entrega;
                            newEntrega = new Date().toISOString();
                          } else if (newStatus === 'Em andamento' && formData.status === 'Concluído') {
                            if (formData.originalEntrega) {
                              newEntrega = formData.originalEntrega;
                            }
                          }
                          
                          setFormData({ ...formData, status: newStatus as any, entrega: newEntrega, originalEntrega: newOriginalEntrega });
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          formData.status === s.name
                            ? 'shadow-md'
                            : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}
                        style={formData.status === s.name ? { backgroundColor: s.color, color: getContrastColor(s.color) } : {}}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#050714] text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
