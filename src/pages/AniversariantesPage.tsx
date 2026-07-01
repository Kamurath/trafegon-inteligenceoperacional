import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Aniversariante, AppSettings } from '../types';
import { loadAniversariantes, saveAniversariantes } from '../lib/birthdayUtils';
import { loadSettings } from '../lib/settingsUtils';
import { X, Trash2, Edit2, Check, Cake, Plus, Filter, MoreVertical, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { getContrastColor } from '../constants';
import { loadDynamicUnits, DynamicUnit } from '../lib/infoUtils';
import { UnitManagementModal } from '../components/UnitManagementModal';

interface AniversariantesPageProps {
  searchQuery: string;
  refreshKey?: number;
}

type FilterType = 'Mês Atual' | 'Pronto' | 'Aguardando' | 'Todos';

export const AniversariantesPage: React.FC<AniversariantesPageProps> = ({ searchQuery, refreshKey }) => {
  const [birthdays, setBirthdays] = useState<Aniversariante[]>(loadAniversariantes());
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [units, setUnits] = useState<DynamicUnit[]>(loadDynamicUnits());
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('Mês Atual');
  const [unitFilter, setUnitFilter] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Aniversariante | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Aniversariante, 'id'>>({
    name: '',
    unidade: '',
    foto: '',
    status: 'Aguardando',
    data: new Date().toISOString().split('T')[0],
    posicao: '',
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'HOJE';
    }
    
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  useEffect(() => {
    setBirthdays(loadAniversariantes());
    setUnits(loadDynamicUnits());
    
    const handleSettingsChange = () => {
      setSettings(loadSettings());
      setUnits(loadDynamicUnits());
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, [refreshKey]);

  useEffect(() => {
    saveAniversariantes(birthdays);
  }, [birthdays]);

  const getUnitColor = (name: string) => settings.unidades.find(u => u.name === name)?.color || '#FFFFFF';
  const getStatusColor = (name: string) => settings.statusAniversariantes.find(s => s.name === name)?.color || '#050714';

  const filteredBirthdays = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    return birthdays
      .filter((item) => {
        // Status/Month Filter logic
        let matchesFilter = true;
        if (filter === 'Mês Atual') {
          const itemDate = new Date(item.data + 'T00:00:00');
          matchesFilter = itemDate.getMonth() === currentMonth;
        } else if (filter !== 'Todos') {
          matchesFilter = item.status === filter;
        }

        // Unit Filter logic
        const matchesUnit = unitFilter === 'Todos' || item.unidade === unitFilter;

        // Search logic
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(searchLower) ||
          item.unidade.toLowerCase().includes(searchLower) ||
          item.status.toLowerCase().includes(searchLower);

        return matchesFilter && matchesUnit && matchesSearch;
      })
      .sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  }, [birthdays, filter, unitFilter, searchQuery]);

  const handleAddBirthday = () => {
    setEditingBirthday(null);
    setFormData({
      name: '',
      unidade: '',
      foto: '',
      status: 'Aguardando',
      data: new Date().toISOString().split('T')[0],
      posicao: '',
    });
    setIsModalOpen(true);
  };

  const handleEditBirthday = (item: Aniversariante) => {
    setEditingBirthday(item);
    setFormData({
      name: item.name,
      unidade: item.unidade,
      foto: item.foto,
      status: item.status,
      data: item.data,
      posicao: item.posicao,
    });
    setIsModalOpen(true);
  };

  const handleDeleteBirthday = (id: string) => {
    setBirthdays(birthdays.filter((b) => b.id !== id));
    setDeletingId(null);
  };

  const handleToggleStatus = (id: string) => {
    setBirthdays(
      birthdays.map((b) => {
        if (b.id !== id) return b;
        const nextStatus: Aniversariante['status'] = 
          b.status === 'Aguardando' ? 'Em andamento' :
          b.status === 'Em andamento' ? 'Pronto' : 'Aguardando';
        
        let newData = b.data;
        if (nextStatus === 'Aguardando') {
          const date = new Date(b.data + 'T00:00:00');
          date.setFullYear(date.getFullYear() + 1);
          newData = date.toISOString().split('T')[0];
        }
        
        return { ...b, status: nextStatus, data: newData };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBirthday) {
      setBirthdays(birthdays.map((b) => (b.id === editingBirthday.id ? { ...formData, id: b.id } : b)));
    } else {
      const newBirthday: Aniversariante = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setBirthdays([...birthdays, newBirthday]);
    }
    setIsModalOpen(false);
  };

  const groupedBirthdays = useMemo(() => {
    const groups: { [key: string]: Aniversariante[] } = {};
    
    filteredBirthdays.forEach(item => {
      const date = new Date(item.data + 'T00:00:00');
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      const key = `Aniversariantes de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [filteredBirthdays]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 px-2 pb-20"
    >
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {/* 1. Mês Atual */}
          <button
            onClick={() => setFilter('Mês Atual')}
            className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
              filter === 'Mês Atual'
                ? 'bg-[#FDBA74] text-[#050714]'
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Mês Atual
          </button>

          {/* 2. Aguardando */}
          {settings.statusAniversariantes.filter(s => s.name === 'Aguardando').map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.name)}
              className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
                filter === s.name
                  ? 'shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={filter === s.name ? { backgroundColor: s.color, color: getContrastColor(s.color) } : {}}
            >
              {s.name}
            </button>
          ))}

          {/* 3. Em andamento */}
          {settings.statusAniversariantes.filter(s => s.name === 'Em andamento').map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.name)}
              className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
                filter === s.name
                  ? 'shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={filter === s.name ? { backgroundColor: s.color, color: getContrastColor(s.color) } : {}}
            >
              {s.name}
            </button>
          ))}

          {/* 4. Pronto */}
          {settings.statusAniversariantes.filter(s => s.name === 'Pronto').map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.name)}
              className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
                filter === s.name
                  ? 'shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={filter === s.name ? { backgroundColor: s.color, color: getContrastColor(s.color) } : {}}
            >
              {s.name}
            </button>
          ))}

          {/* 5. Todos */}
          <button
            onClick={() => setFilter('Todos')}
            className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
              filter === 'Todos'
                ? 'bg-[#050714] dark:bg-white dark:text-[#050714] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mr-2 whitespace-nowrap">Unidade:</span>
          <button
            onClick={() => setUnitFilter('Todos')}
            className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
              unitFilter === 'Todos'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          {units.map(u => {
            const uName = u.prefix;
            const settingsUnit = settings.unidades.find(unit => unit.name === uName) || { name: uName, color: '#FFFFFF' };
            return (
              <button
                key={uName}
                onClick={() => setUnitFilter(uName)}
                className={`px-4 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all whitespace-nowrap ${
                  unitFilter === uName
                    ? 'shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                style={unitFilter === uName ? { backgroundColor: settingsUnit.color, color: getContrastColor(settingsUnit.color) } : {}}
              >
                {uName}
              </button>
            );
          })}
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="px-3 py-1 bg-[#FDBA74] hover:bg-orange-400 text-[#050714] rounded-full text-[10px] font-bold transition-all border border-orange-200 dark:border-orange-950 flex items-center gap-1 whitespace-nowrap shadow-sm"
          >
            <Settings className="w-3 h-3" /> Gerenciar
          </button>
        </div>
      </div>

      {/* Table / Mobile Cards */}
      <div className="w-full">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[1.5fr_0.5fr_0.5fr_1fr_1fr_0.5fr_80px] gap-2 mb-2 px-5 py-2 bg-[#050714] dark:bg-black rounded-t-xl text-white text-[10px] font-bold uppercase tracking-wider">
          <div>Aniversariantes</div>
          <div className="text-center">Unidade</div>
          <div className="text-center">Foto</div>
          <div className="text-center">Status</div>
          <div className="text-center">Data</div>
          <div className="text-center">Posição</div>
          <div className="text-center">Ações</div>
        </div>

        {/* Rows */}
        <div className="lg:hidden space-y-6">
          {Object.entries(groupedBirthdays).map(([groupName, groupItems]: [string, Aniversariante[]]) => (
            <div key={groupName} className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-orange-400 rounded-full" />
                {groupName}
              </h3>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden active:scale-[0.98] transition-all touch-none"
                    onClick={() => handleEditBirthday(item)}
                  >
                    <div className="p-2 flex gap-2.5">
                      {/* Photo/Icon */}
                      <div className="flex-shrink-0">
                        {item.foto && item.foto.startsWith('http') ? (
                          <img 
                            src={item.foto} 
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border-2 border-orange-100 dark:border-orange-900/30 shadow-sm"
                          />
                        ) : (
                          <div className="w-7 h-7 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center shadow-sm">
                            <Cake className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight break-words">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }}
                              className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 text-[6.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <span 
                            className="px-1 py-0.5 rounded"
                            style={{ 
                              backgroundColor: getUnitColor(item.unidade),
                              color: getContrastColor(getUnitColor(item.unidade))
                            }}
                          >
                            {item.unidade}
                          </span>
                          <span>|</span>
                          <span 
                            className="px-1 py-0.5 rounded"
                            style={{ 
                              backgroundColor: getStatusColor(item.status),
                              color: getContrastColor(getStatusColor(item.status))
                            }}
                          >
                            {item.status}
                          </span>
                          <span>|</span>
                          <div className="flex items-center gap-1">
                            <Cake className="w-2 h-2 text-orange-400" />
                            <span className="text-[6.5px] font-black uppercase tracking-widest text-gray-400">
                              {item.data.split('-').reverse().slice(0, 2).join('/')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deletion Confirmation */}
                    {deletingId === item.id && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Excluir aniversariante?</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteBirthday(item.id)} className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Sim</button>
                            <button onClick={() => setDeletingId(null)} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-black uppercase tracking-widest rounded-lg">Não</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Rows */}
        <div className="hidden lg:block space-y-2">
          {filteredBirthdays.map((item) => {
            const isEditing = editingBirthday?.id === item.id;
            return (
              <div 
                key={item.id} 
                className={`flex flex-col lg:grid lg:grid-cols-[1.5fr_0.5fr_0.5fr_1fr_1fr_0.5fr_80px] gap-2 items-stretch group transition-all p-0 lg:p-0 bg-white dark:bg-gray-900 lg:bg-transparent rounded-2xl lg:rounded-none border lg:border-none border-gray-100 dark:border-gray-800 shadow-sm lg:shadow-none overflow-hidden ${
                  isEditing ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20' : ''
                }`}
              >
                {/* Desktop Name */}
                <div className="hidden lg:flex bg-[#050714] dark:bg-black text-white px-4 py-3 text-sm font-medium items-center min-w-0 rounded-xl lg:rounded-none">
                  <div className="cursor-text w-full break-words" onClick={() => handleEditBirthday(item)}>
                    {item.name}
                  </div>
                </div>
                
                {/* Desktop Cells */}
                <div className="hidden lg:flex border border-gray-100 dark:border-gray-800 items-center justify-center text-[10px] lg:text-xs font-bold rounded-lg py-2 px-2"
                  style={{ 
                    backgroundColor: getUnitColor(item.unidade),
                    color: getContrastColor(getUnitColor(item.unidade))
                  }}
                >
                  <div className="cursor-pointer w-full text-center" onClick={() => handleEditBirthday(item)}>
                    {item.unidade}
                  </div>
                </div>

                <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center p-1 rounded-lg">
                  <div className="bg-white dark:bg-gray-900 flex items-center justify-center text-[10px] font-bold text-blue-500 italic underline rounded-lg py-1 cursor-pointer hover:text-blue-600">
                    {item.foto && item.foto.startsWith('http') ? (
                      <a href={item.foto} target="_blank" rel="noopener noreferrer">
                        Ver Foto
                      </a>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 no-underline cursor-default">Sem Foto</span>
                    )}
                  </div>
                </div>

                <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center p-1 rounded-lg">
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className="w-full py-1.5 rounded-lg text-[10px] font-bold text-center transition-colors"
                    style={{ 
                      backgroundColor: getStatusColor(item.status),
                      color: getContrastColor(getStatusColor(item.status))
                    }}
                  >
                    {item.status}
                  </button>
                </div>

                <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center p-1 rounded-lg">
                  <div 
                    onClick={() => handleEditBirthday(item)}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center cursor-text ${
                      formatDate(item.data).toUpperCase().includes('HOJE') ? 'bg-[#86EFAC] text-[#166534]' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatDate(item.data)}
                  </div>
                </div>

                {/* Desktop Position */}
                <div className="hidden lg:flex bg-[#3B82F6] text-white items-center justify-center text-xs font-bold py-3">
                  {(filteredBirthdays.indexOf(item) + 1).toString().padStart(2, '0')}
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center gap-2 rounded-r-xl py-3 px-2">
                  <button
                    onClick={() => handleEditBirthday(item)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {deletingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteBirthday(item.id)}
                        className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Confirmar"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div className="hidden lg:grid grid-cols-[1.5fr_0.5fr_0.5fr_1fr_1fr_0.5fr_80px] gap-2 items-stretch">
            <button
              onClick={handleAddBirthday}
              className="bg-[#050714] dark:bg-black text-white px-6 py-3 rounded-l-xl text-sm font-medium text-left hover:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
            >
              + Adicionar Aniversariante
            </button>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 dark:text-gray-700 rounded-lg py-3">-</div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 dark:text-gray-700 rounded-lg py-3">-</div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 dark:text-gray-700 rounded-lg py-3">-</div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 dark:text-gray-700 rounded-lg py-3">-</div>
            <div className="bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold opacity-50 py-3">
              {(filteredBirthdays.length + 1).toString().padStart(2, '0')}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center rounded-r-xl py-3">-</div>
          </div>

          <button
            onClick={handleAddBirthday}
            className="lg:hidden w-full py-4 bg-[#050714] dark:bg-white dark:text-[#050714] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            + Novo Aniversariante
          </button>
        </div>
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
                  {editingBirthday ? 'Editar Aniversariante' : 'Novo Aniversariante'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:opacity-70 transition-opacity">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-gray-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Nome</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all text-sm dark:text-white"
                    placeholder="Nome do aniversariante"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Unidade</label>
                    <select
                      required
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all text-sm dark:text-white"
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.map(u => <option key={u.prefix} value={u.prefix}>{u.prefix}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Foto (Link)</label>
                    <input
                      type="text"
                      value={formData.foto}
                      onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all text-sm dark:text-white"
                      placeholder="Link da foto (opcional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Data</label>
                    <input
                      required
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.statusAniversariantes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s.name as any })}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                          formData.status === s.name
                            ? 'shadow-md'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700'
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
                    className="w-full py-3 bg-[#050714] dark:bg-white dark:text-[#050714] text-white rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingBirthday ? 'Salvar Alterações' : 'Criar Aniversariante'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Unit Management Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
          <UnitManagementModal
            isOpen={isManageModalOpen}
            onClose={() => setIsManageModalOpen(false)}
            onUnitsUpdated={() => {
              setBirthdays(loadAniversariantes());
              setUnits(loadDynamicUnits());
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
