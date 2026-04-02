import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Birthday, AppSettings } from '../types';
import { loadBirthdays, saveBirthdays } from '../lib/birthdayUtils';
import { loadSettings } from '../lib/settingsUtils';
import { Search, Plus, X, Calendar, MapPin, User, Trash2, Edit2, Check, Filter } from 'lucide-react';
import { getContrastColor } from '../constants';

interface AniversariantesPageProps {
  searchQuery: string;
  refreshKey?: number;
}

export const AniversariantesPage: React.FC<AniversariantesPageProps> = ({ searchQuery, refreshKey }) => {
  const [birthdays, setBirthdays] = useState<Birthday[]>(loadBirthdays());
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [unitFilter, setUnitFilter] = useState<string>('Todas');
  const [monthFilter, setMonthFilter] = useState<string>('Todos');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Birthday, 'id'>>({
    name: '',
    date: '',
    unit: '',
    role: '',
    photo: '',
  });

  useEffect(() => {
    setBirthdays(loadBirthdays());
    setSettings(loadSettings());
  }, [refreshKey]);

  useEffect(() => {
    saveBirthdays(birthdays);
  }, [birthdays]);

  const filteredBirthdays = useMemo(() => {
    return birthdays.filter((b) => {
      const matchesSearch = 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesUnit = unitFilter === 'Todas' || b.unit === unitFilter;
      
      const matchesMonth = monthFilter === 'Todos' || (() => {
        const date = new Date(b.date + 'T00:00:00');
        return date.getMonth().toString() === monthFilter;
      })();

      return matchesSearch && matchesUnit && matchesMonth;
    }).sort((a, b) => {
      const dateA = new Date(a.date + 'T00:00:00');
      const dateB = new Date(b.date + 'T00:00:00');
      
      // Compare by day and month only
      const dayMonthA = dateA.getMonth() * 100 + dateA.getDate();
      const dayMonthB = dateB.getMonth() * 100 + dateB.getDate();
      
      return dayMonthA - dayMonthB;
    });
  }, [birthdays, searchQuery, unitFilter, monthFilter]);

  const handleAddBirthday = () => {
    setEditingBirthday(null);
    setFormData({ name: '', date: '', unit: '', role: '', photo: '' });
    setIsModalOpen(true);
  };

  const handleEditBirthday = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setFormData({
      name: birthday.name,
      date: birthday.date,
      unit: birthday.unit,
      role: birthday.role,
      photo: birthday.photo || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteBirthday = (id: string) => {
    setBirthdays(birthdays.filter((b) => b.id !== id));
    setDeletingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBirthday) {
      setBirthdays(birthdays.map((b) => (b.id === editingBirthday.id ? { ...formData, id: b.id } : b)));
    } else {
      const newBirthday: Birthday = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setBirthdays([...birthdays, newBirthday]);
    }
    setIsModalOpen(false);
  };

  const getMonthName = (monthIndex: number) => {
    return new Date(2024, monthIndex).toLocaleDateString('pt-BR', { month: 'long' });
  };

  const getUnitColor = (name: string) => settings.unidades.find(u => u.name === name)?.color || '#3B82F6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 px-2 pb-20"
    >
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
          <Filter className="w-3 h-3 ml-2 text-gray-400" />
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="bg-transparent text-[10px] font-bold outline-none pr-4 dark:text-white"
          >
            <option value="Todas">Todas Unidades</option>
            {settings.unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
          <Calendar className="w-3 h-3 ml-2 text-gray-400" />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-transparent text-[10px] font-bold outline-none pr-4 dark:text-white"
          >
            <option value="Todos">Todos os Meses</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{getMonthName(i)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Birthday Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBirthdays.map((birthday) => (
          <motion.div
            key={birthday.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="p-4 flex gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-900 shadow-sm">
                  {birthday.photo ? (
                    <img src={birthday.photo} alt={birthday.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm border-2 border-white dark:border-gray-900"
                  style={{ backgroundColor: getUnitColor(birthday.unit) }}
                >
                  {birthday.unit.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{birthday.name}</h3>
                    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{birthday.role}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditBirthday(birthday)} className="p-1 text-gray-400 hover:text-blue-500"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => setDeletingId(birthday.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(birthday.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </span>
                  </div>
                  <div 
                    className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                    style={{ 
                      backgroundColor: getUnitColor(birthday.unit) + '20',
                      color: getUnitColor(birthday.unit)
                    }}
                  >
                    {birthday.unit}
                  </div>
                </div>
              </div>
            </div>

            {deletingId === birthday.id && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Excluir aniversariante?</span>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteBirthday(birthday.id)} className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Sim</button>
                  <button onClick={() => setDeletingId(null)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[8px] font-black uppercase tracking-widest rounded-lg">N\u00e3o</button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <button
          onClick={handleAddBirthday}
          className="h-[100px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Novo Aniversariante</span>
        </button>
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="Nome do colaborador"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Data de Nascimento</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Unidade</label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    >
                      <option value="">Selecione</option>
                      {settings.unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Cargo / Fun\u00e7\u00e3o</label>
                  <input
                    required
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="Ex: Gerente de Marketing"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">URL da Foto (Opcional)</label>
                  <input
                    type="url"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#050714] text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingBirthday ? 'Salvar Altera\u00e7\u00f5es' : 'Adicionar'}
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
