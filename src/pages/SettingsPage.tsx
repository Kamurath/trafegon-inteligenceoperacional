import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings, SettingItem } from '../types';
import { loadSettings, saveSettings } from '../lib/settingsUtils';
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, Palette } from 'lucide-react';
import { getContrastColor } from '../constants';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [editingItem, setEditingItem] = useState<{ section: keyof AppSettings; id: string } | null>(null);
  const [tempItem, setTempItem] = useState<SettingItem | null>(null);
  const [isAddingTo, setIsAddingTo] = useState<keyof AppSettings | null>(null);

  useEffect(() => {
    saveSettings(settings);
    // Dispatch a custom event to notify other components that settings have changed
    window.dispatchEvent(new Event('settingsChanged'));
  }, [settings]);

  const handleMove = (section: keyof AppSettings, index: number, direction: 'up' | 'down') => {
    const newList = [...settings[section]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setSettings({ ...settings, [section]: newList });
  };

  const handleRemove = (section: keyof AppSettings, id: string) => {
    if (window.confirm('Deseja realmente remover este item?')) {
      setSettings({
        ...settings,
        [section]: settings[section].filter(item => item.id !== id)
      });
    }
  };

  const startEdit = (section: keyof AppSettings, item: SettingItem) => {
    setEditingItem({ section, id: item.id });
    setTempItem({ ...item });
  };

  const saveEdit = () => {
    if (!editingItem || !tempItem) return;
    const { section, id } = editingItem;
    setSettings({
      ...settings,
      [section]: settings[section].map(item => item.id === id ? tempItem : item)
    });
    setEditingItem(null);
    setTempItem(null);
  };

  const startAdd = (section: keyof AppSettings) => {
    setIsAddingTo(section);
    setTempItem({ id: Math.random().toString(36).substr(2, 9), name: '', color: '#3B82F6' });
  };

  const saveAdd = () => {
    if (!isAddingTo || !tempItem || !tempItem.name) return;
    setSettings({
      ...settings,
      [isAddingTo]: [...settings[isAddingTo], tempItem]
    });
    setIsAddingTo(null);
    setTempItem(null);
  };

  const renderSection = (title: string, section: keyof AppSettings) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#050714] px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h3>
        <button 
          onClick={() => startAdd(section)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-2">
        {settings[section].map((item, index) => {
          const isEditing = editingItem?.section === section && editingItem?.id === item.id;
          
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
              {isEditing ? (
                <div className="flex-1 flex items-center gap-3">
                  <input 
                    type="text"
                    value={tempItem?.name}
                    onChange={e => setTempItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <div className="relative flex items-center gap-2">
                    <input 
                      type="color"
                      value={tempItem?.color}
                      onChange={e => setTempItem(prev => prev ? { ...prev, color: e.target.value } : null)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                    />
                    <Palette className="w-4 h-4 text-gray-400 absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
                  </div>
                  <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingItem(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => handleMove(section, index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleMove(section, index, 'down')}
                      disabled={index === settings[section].length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div 
                    className="px-3 py-1.5 rounded-lg text-xs font-bold min-w-[80px] text-center shadow-sm"
                    style={{ backgroundColor: item.color, color: getContrastColor(item.color) }}
                  >
                    {item.name}
                  </div>
                  <div className="flex-1 text-sm font-medium text-gray-600 truncate">{item.name}</div>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(section, item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemove(section, item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <AnimatePresence>
          {isAddingTo === section && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100"
            >
              <input 
                type="text"
                placeholder="Novo item..."
                value={tempItem?.name}
                onChange={e => setTempItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="relative flex items-center gap-2">
                <input 
                  type="color"
                  value={tempItem?.color}
                  onChange={e => setTempItem(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                />
                <Palette className="w-4 h-4 text-gray-400 absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
              </div>
              <button onClick={saveAdd} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsAddingTo(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {settings[section].length === 0 && !isAddingTo && (
          <div className="text-center py-8 text-gray-400 text-sm italic">
            Nenhum item cadastrado.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#050714]">Configurações</h2>
          <p className="text-gray-500 text-sm">Gerencie as listas e padrões do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderSection('Solicitantes (Pauta)', 'solicitantes')}
        {renderSection('Unidades (Geral)', 'unidades')}
        {renderSection('Status da Pauta', 'statusPauta')}
        {renderSection('Status de Aniversariantes', 'statusAniversariantes')}
      </div>
    </motion.div>
  );
};
