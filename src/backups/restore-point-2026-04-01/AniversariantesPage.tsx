// BACKUP OF /src/pages/AniversariantesPage.tsx as of 2026-04-01
import React, { useState, useMemo } from 'react';
import { Aniversariante } from '../types';
import { Plus, Search, Trash2, Edit2, User, Building2, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { UNIT_COLORS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface AniversariantesPageProps {
  birthdays: Aniversariante[];
  onUpdateBirthday: (birthday: Aniversariante) => void;
  onDeleteBirthday: (id: string) => void;
  onAddBirthday: (birthday: Omit<Aniversariante, 'id' | 'posicao'>) => void;
  searchQuery: string;
}

export const AniversariantesPage: React.FC<AniversariantesPageProps> = ({ birthdays, onUpdateBirthday, onDeleteBirthday, onAddBirthday, searchQuery }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBirthday, setNewBirthday] = useState<Omit<Aniversariante, 'id' | 'posicao'>>({
    name: '',
    unidade: 'ARA',
    data: new Date().toISOString().split('T')[0],
    status: 'Aguardando',
    foto: '',
  });

  const filteredBirthdays = useMemo(() => {
    return birthdays.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.unidade.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return dateA.getTime() - dateB.getTime();
    });
  }, [birthdays, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBirthday(newBirthday);
    setIsModalOpen(false);
    setNewBirthday({
      name: '',
      unidade: 'ARA',
      data: new Date().toISOString().split('T')[0],
      status: 'Aguardando',
      foto: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pronto': return 'bg-green-500 text-white';
      case 'Em andamento': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">ANIVERSARIANTES</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Cronograma de artes e comemorações</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Adicionar Aniversariante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBirthdays.map((birthday, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              key={birthday.id}
              className="group bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 rounded-[32px] p-6 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#050714] shadow-inner">
                    {birthday.foto ? (
                      <img src={birthday.foto} alt={birthday.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors leading-tight">
                      {birthday.name}
                    </h3>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400" style={{ color: UNIT_COLORS[birthday.unidade] }}>
                      {birthday.unidade}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(birthday.status)}`}>
                    {birthday.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatDate(birthday.data)}</span>
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Data do Evento</div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onUpdateBirthday({
                      ...birthday,
                      status: birthday.status === 'Pronto' ? 'Aguardando' : birthday.status === 'Aguardando' ? 'Em andamento' : 'Pronto'
                    })}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Alterar Status
                  </button>
                  <button className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteBirthday(birthday.id)}
                    className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Novo Aniversariante */}
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
              <h3 className="text-3xl font-black tracking-tighter mb-6 text-gray-900 dark:text-white uppercase">Novo Aniversariante</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white"
                    value={newBirthday.name}
                    onChange={e => setNewBirthday({ ...newBirthday, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Unidade</label>
                    <select
                      className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white appearance-none"
                      value={newBirthday.unidade}
                      onChange={e => setNewBirthday({ ...newBirthday, unidade: e.target.value })}
                    >
                      {Object.keys(UNIT_COLORS).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white"
                      value={newBirthday.data}
                      onChange={e => setNewBirthday({ ...newBirthday, data: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Link da Foto (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 outline-none transition-all font-bold dark:text-white"
                    value={newBirthday.foto}
                    onChange={e => setNewBirthday({ ...newBirthday, foto: e.target.value })}
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
                    Salvar Dados
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
