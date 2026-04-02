import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings } from '../types';
import { loadSettings, saveSettings } from '../lib/settingsUtils';
import { Plus, Trash2, Palette, GripVertical, Check, X, Moon, Sun, Monitor } from 'lucide-react';
import { getContrastColor } from '../constants';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [activeTab, setActiveTab] = useState<'unidades' | 'solicitantes' | 'status' | 'geral'>('unidades');

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const addItem = (type: 'unidades' | 'solicitantes' | 'statusPauta') => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Item',
      color: '#3B82F6',
    };
    setSettings({
      ...settings,
      [type]: [...settings[type], newItem],
    });
  };

  const removeItem = (type: 'unidades' | 'solicitantes' | 'statusPauta', id: string) => {
    setSettings({
      ...settings,
      [type]: settings[type].filter(item => item.id !== id),
    });
  };

  const updateItem = (type: 'unidades' | 'solicitantes' | 'statusPauta', id: string, field: 'name' | 'color', value: string) => {
    setSettings({
      ...settings,
      [type]: settings[type].map(item => item.id === id ? { ...item, [field]: value } : item),
    });
  };

  const SettingSection = ({ title, type }: { title: string, type: 'unidades' | 'solicitantes' | 'statusPauta' }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</h3>
        <button
          onClick={() => addItem(type)}
          className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {settings[type].map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-xl flex items-center gap-3 shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-gray-300" />
            </div>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(type, item.id, 'name', e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold outline-none dark:text-white"
            />
            <div className="relative flex items-center gap-2">
              <input
                type="color"
                value={item.color}
                onChange={(e) => updateItem(type, item.id, 'color', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <button
                onClick={() => removeItem(type, item.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 px-2 pb-20"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'unidades', label: 'Unidades' },
          { id: 'solicitantes', label: 'Solicitantes' },
          { id: 'status', label: 'Status Pauta' },
          { id: 'geral', label: 'Geral' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#050714] dark:bg-white dark:text-[#050714] text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {activeTab === 'unidades' && (
            <SettingSection title="Gerenciar Unidades" type="unidades" />
          )}
          {activeTab === 'solicitantes' && (
            <SettingSection title="Gerenciar Solicitantes" type="solicitantes" />
          )}
          {activeTab === 'status' && (
            <SettingSection title="Status da Pauta" type="statusPauta" />
          )}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Tema do Sistema</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', icon: Sun, label: 'Claro' },
                    { id: 'dark', icon: Moon, label: 'Escuro' },
                    { id: 'system', icon: Monitor, label: 'Sistema' },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSettings({ ...settings, theme: theme.id as any })}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                        settings.theme === theme.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                      }`}
                    >
                      <theme.icon className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 text-white rounded-xl">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Personaliza\u00e7\u00e3o Visual</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      As cores definidas aqui ser\u00e3o aplicadas em todo o sistema, 
                      incluindo etiquetas, filtros e indicadores de status.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
