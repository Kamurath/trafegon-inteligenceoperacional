import { Task } from '../types';

const STORAGE_KEY = 'pauta_tasks_v3';

export const defaultTasks: Task[] = [
  { id: '01', title: 'AGENDAR: HORARIO DE FUNCIONAMENTO FERIADO', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '02', title: 'DEMANDA DE RAQUEL - CARTÃO DE PÁSCOA', unidade: 'GUS + CZ', solicitante: 'Raquel', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '03', title: 'EDITAR VÍDEO DE ANA LAURA', unidade: 'MUR', solicitante: 'Ana Laura', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '04', title: 'VAGA CONSULTORA - VSA', unidade: 'VSA', solicitante: 'Rebeca', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '05', title: 'PAINEL DE ANIVERSARIANTES + LISTINHA DE ABR', unidade: 'GUS', solicitante: 'Alice', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '06', title: 'CHECAR DEMANDA WHATSAPP', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '07', title: 'RECICLAR CONTEÚDO PARA ABRIL', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '08', title: 'LISTAR PONTOS ESTRATÉGICOS PRA FORTALEZA', unidade: 'FOR', solicitante: 'Eduardo', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '09', title: 'REVISAR CONTAS PESSOAIS', unidade: 'PESSOAL', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '10', title: 'ORÇAMENTO DE NETO', unidade: 'URGENTE', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '11', title: 'LISTA DE VÍDEOS DE REFERÊNCIA', unidade: 'TODAS', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '12', title: 'DIAGNÓSTICO E PLANO DE AÇÃO PRA RAQUEL', unidade: 'OUTROS', solicitante: 'Raquel', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '13', title: 'CRIAR CONTRATO DE DIARISTA COM NEILDA', unidade: 'PESSOAL', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
  { id: '14', title: 'NEGÓCIO PARALELO - GOOGLE MEU NEGÓCIO', unidade: 'AGÊNCIA 087', solicitante: 'Fritz', status: 'Em andamento', entrega: '2026-04-01', posicao: '' },
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

  // Migration: Check for v2 if v3 is empty
  const v2Stored = localStorage.getItem('pauta_tasks_v2');
  if (v2Stored) {
    try {
      const data = JSON.parse(v2Stored);
      // Save to v3 for future use
      localStorage.setItem(STORAGE_KEY, v2Stored);
      return data;
    } catch (e) {
      console.error('Error migrating tasks from v2:', e);
    }
  }

  return defaultTasks;
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
