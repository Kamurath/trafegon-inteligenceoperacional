import { AppSettings } from '../types';

const STORAGE_KEY = 'trafegon_settings';

const defaultSettings: AppSettings = {
  unidades: [
    { id: '1', name: 'Matriz', color: '#3B82F6' },
    { id: '2', name: 'Filial Sul', color: '#10B981' },
    { id: '3', name: 'Filial Norte', color: '#F59E0B' },
  ],
  solicitantes: [
    { id: '1', name: 'Diretoria', color: '#050714' },
    { id: '2', name: 'Marketing', color: '#EC4899' },
    { id: '3', name: 'Operacional', color: '#6366F1' },
  ],
  statusPauta: [
    { id: '1', name: 'Em andamento', color: '#FDBA74' },
    { id: '2', name: 'Conclu\u00eddo', color: '#BFDBFE' },
    { id: '3', name: 'Atrasado', color: '#FECACA' },
  ],
  theme: 'light',
};

export const loadSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultSettings;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('settingsChanged'));
};
