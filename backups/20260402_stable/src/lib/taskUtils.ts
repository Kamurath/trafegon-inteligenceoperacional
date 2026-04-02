import { Task } from '../types';

export const STORAGE_KEY = 'trafegon_tasks';
export const SEED_VERSION_KEY = 'trafegon_tasks_seed_version';
export const CURRENT_SEED_VERSION = '1.2';

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Revis\u00e3o de Pauta Semanal',
    unidade: 'Matriz',
    solicitante: 'Diretoria',
    status: 'Em andamento',
    entrega: '2026-04-05T10:00:00',
    posicao: '01',
  },
  {
    id: '2',
    title: 'Campanha de Marketing Abril',
    unidade: 'Filial Sul',
    solicitante: 'Marketing',
    status: 'Em andamento',
    entrega: '2026-04-10T15:30:00',
    posicao: '02',
  }
];

export const loadTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const seedVersion = localStorage.getItem(SEED_VERSION_KEY);

  if (!stored || seedVersion !== CURRENT_SEED_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
    return defaultTasks;
  }

  return JSON.parse(stored);
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
