import { Task } from '../types';

const STORAGE_KEY = 'pauta_tasks_v5';

export const defaultTasks: Task[] = [
  { id: '01', title: 'REVISAR CONTAS PESSOAIS', unidade: 'PESSOAL', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '1' },
  { id: '02', title: '>> EMITIR E ENVIAR APORTE DE LIA E MÁRCIO', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-02T12:00:00', posicao: '2' },
  { id: '03', title: 'SUBIR CAMPANHAS', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-02', posicao: '3' },
  { id: '04', title: 'PAINEL DE ANIVERSARIANTES + LISTINHA DE ABR', unidade: 'GUS', solicitante: 'Alice', status: 'Em andamento', entrega: '2026-04-02', posicao: '4' },
  { id: '05', title: 'EDITAR VÍDEO DE ANA LAURA', unidade: 'MUR', solicitante: 'Ana Laura', status: 'Em andamento', entrega: '2026-04-02', posicao: '5' },
  { id: '06', title: 'CHECAR DEMANDA WHATSAPP', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-02', posicao: '6' },
  { id: '07', title: 'LISTAR PONTOS ESTRATÉGICOS PRA FORTALEZA', unidade: 'FOR', solicitante: 'Eduardo', status: 'Em andamento', entrega: '2026-04-02', posicao: '7' },
  { id: '08', title: 'AGENDAR: HORARIO DE FUNCIONAMENTO FERIADO', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-02', posicao: '8' },
  { id: '09', title: 'LISTA DE VÍDEOS DE REFERÊNCIA', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-02', posicao: '9' },
  { id: '10', title: 'DIAGNÓSTICO E PLANO DE AÇÃO PRA RAQUEL', unidade: 'OUTROS', solicitante: 'Raquel', status: 'Em andamento', entrega: '2026-04-02', posicao: '10' },
  { id: '11', title: 'ORÇAMENTO DE NETO', unidade: 'AGÊNCIA 087', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-02', posicao: '11' },
  { id: '12', title: 'RECICLAR CONTEÚDO PARA ABRIL', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-03', posicao: '12' },
  { id: '13', title: 'CRIAR CONTRATO DE DIARISTA COM NEILDA', unidade: 'PESSOAL', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-03', posicao: '13' },
  { id: '14', title: 'NEGÓCIO PARALELO - GOOGLE MEU NEGÓCIO', unidade: 'AGÊNCIA 087', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-03', posicao: '14' },
];

export const loadTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading tasks from localStorage:', e);
    }
  }

  // If no v4 data, return the new default real task list
  return defaultTasks;
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
