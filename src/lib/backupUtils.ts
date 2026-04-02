import { AppData, BackupSnapshot } from '../types';
import { loadTasks, saveTasks, SEED_VERSION_KEY as TASK_SEED_KEY, CURRENT_SEED_VERSION as TASK_SEED_VERSION } from './taskUtils';
import { loadAniversariantes, saveAniversariantes, SEED_VERSION_KEY as BIRTHDAY_SEED_KEY, CURRENT_SEED_VERSION as BIRTHDAY_SEED_VERSION } from './birthdayUtils';
import { loadUnitInfo, saveUnitInfo } from './infoUtils';
import { loadSettings, saveSettings } from './settingsUtils';

const SNAPSHOTS_KEY = 'trafegon_backups';
const LAST_MANUAL_BACKUP_KEY = 'trafegon_last_manual_backup';
const MAX_SNAPSHOTS = 10;

export const getFullAppData = (): AppData => {
  return {
    tasks: loadTasks(),
    birthdays: loadAniversariantes(),
    units: loadUnitInfo(),
    settings: loadSettings(),
    lastManualBackup: localStorage.getItem(LAST_MANUAL_BACKUP_KEY) || undefined,
  };
};

export const saveFullAppData = (data: AppData) => {
  if (data.tasks) saveTasks(data.tasks);
  if (data.birthdays) saveAniversariantes(data.birthdays);
  if (data.units) saveUnitInfo(data.units);
  if (data.settings) saveSettings(data.settings);
  
  // Update seed versions to prevent data loss on next reload
  localStorage.setItem(TASK_SEED_KEY, TASK_SEED_VERSION.toString());
  localStorage.setItem(BIRTHDAY_SEED_KEY, BIRTHDAY_SEED_VERSION.toString());

  if (data.lastManualBackup) {
    localStorage.setItem(LAST_MANUAL_BACKUP_KEY, data.lastManualBackup);
  }
};

export const createAutoSnapshot = () => {
  const data = getFullAppData();
  const snapshots: BackupSnapshot[] = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
  
  const newSnapshot: BackupSnapshot = {
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    data,
  };

  const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, MAX_SNAPSHOTS);
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updatedSnapshots));
};

export const exportData = () => {
  const data = getFullAppData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  
  a.href = url;
  a.download = `trafegon-backup-${date}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const now = new Date().toISOString();
  localStorage.setItem(LAST_MANUAL_BACKUP_KEY, now);
  return now;
};

export const importData = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as AppData;
        
        // Basic validation - check if at least tasks or birthdays exist
        if ((data.tasks && Array.isArray(data.tasks)) || (data.birthdays && Array.isArray(data.birthdays))) {
          saveFullAppData(data);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.error('Import failed:', err);
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
};

export const checkManualBackupNeeded = (): boolean => {
  const last = localStorage.getItem(LAST_MANUAL_BACKUP_KEY);
  if (!last) return true;
  
  const lastDate = new Date(last).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
};
