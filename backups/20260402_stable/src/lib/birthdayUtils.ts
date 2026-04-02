import { Birthday } from '../types';

export const STORAGE_KEY = 'trafegon_birthdays';
export const SEED_VERSION_KEY = 'trafegon_birthdays_seed_version';
export const CURRENT_SEED_VERSION = '1.2';

const defaultBirthdays: Birthday[] = [
  {
    id: '1',
    name: 'Ana Silva',
    date: '1990-04-02',
    unit: 'Matriz',
    role: 'Gerente',
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    date: '1985-04-15',
    unit: 'Filial Sul',
    role: 'Analista',
  }
];

export const loadBirthdays = (): Birthday[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const seedVersion = localStorage.getItem(SEED_VERSION_KEY);

  if (!stored || seedVersion !== CURRENT_SEED_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBirthdays));
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
    return defaultBirthdays;
  }

  return JSON.parse(stored);
};

export const saveBirthdays = (birthdays: Birthday[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
};
