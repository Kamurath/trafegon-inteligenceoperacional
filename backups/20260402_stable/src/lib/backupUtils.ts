import { AppData, Task, Birthday, AppSettings } from '../types';
import { STORAGE_KEY as TASKS_KEY, SEED_VERSION_KEY as TASKS_SEED_KEY, CURRENT_SEED_VERSION as TASKS_SEED_VERSION } from './taskUtils';
import { STORAGE_KEY as BIRTHDAYS_KEY, SEED_VERSION_KEY as BIRTHDAYS_SEED_KEY, CURRENT_SEED_VERSION as BIRTHDAYS_SEED_VERSION } from './birthdayUtils';
import { loadSettings, saveSettings } from './settingsUtils';

export const getFullAppData = (): AppData => {
  const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
  const birthdays = JSON.parse(localStorage.getItem(BIRTHDAYS_KEY) || '[]');
  const units = JSON.parse(localStorage.getItem('trafegon_units') || '[]');
  const settings = loadSettings();
  
  return { tasks, birthdays, units, settings };
};

export const saveFullAppData = (data: AppData) => {
  if (data.tasks) localStorage.setItem(TASKS_KEY, JSON.stringify(data.tasks));
  if (data.birthdays) localStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(data.birthdays));
  if (data.units) localStorage.setItem('trafegon_units', JSON.stringify(data.units));
  if (data.settings) saveSettings(data.settings);
  
  // Update seed versions to prevent overwriting with default data on reload
  localStorage.setItem(TASKS_SEED_KEY, TASKS_SEED_VERSION);
  localStorage.setItem(BIRTHDAYS_SEED_KEY, BIRTHDAYS_SEED_VERSION);
};

export const exportData = () => {
  const data = getFullAppData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trafegon_backup_${new Date().toISOString().split('T')[0]}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks || data.birthdays) {
          saveFullAppData(data);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
};

export const createAutoSnapshot = () => {
  const data = getFullAppData();
  const snapshots = JSON.parse(localStorage.getItem('trafegon_snapshots') || '[]');
  const newSnapshot = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    data
  };
  
  const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, 5); // Keep last 5
  localStorage.setItem('trafegon_snapshots', JSON.stringify(updatedSnapshots));
};
