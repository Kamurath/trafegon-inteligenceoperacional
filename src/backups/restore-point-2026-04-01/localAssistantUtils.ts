// BACKUP OF /src/lib/localAssistantUtils.ts as of 2026-04-01
import { UNITS, SOLICITANTES } from '../constants';

export type AssistantIntent = 'task' | 'birthday' | null;

export interface AssistantState {
  intent: AssistantIntent;
  step: number;
  data: any;
  isActive: boolean;
}

export const INITIAL_ASSISTANT_STATE: AssistantState = {
  intent: null,
  step: 0,
  data: {},
  isActive: false,
};

const TASK_KEYWORDS = ['adicionar tarefa', 'nova tarefa', 'cadastrar tarefa', 'criar tarefa'];
const BIRTHDAY_KEYWORDS = ['adicionar aniversariante', 'nova aniversariante', 'cadastrar aniversariante', 'adicionar uma aniversariante'];
const CANCEL_KEYWORDS = ['cancelar', 'parar', 'sair'];

export const detectIntent = (text: string): AssistantIntent => {
  const lowerText = text.toLowerCase().trim();
  if (TASK_KEYWORDS.some(k => lowerText.includes(k))) return 'task';
  if (BIRTHDAY_KEYWORDS.some(k => lowerText.includes(k))) return 'birthday';
  return null;
};

export const isCancelCommand = (text: string): boolean => {
  const lowerText = text.toLowerCase().trim();
  return CANCEL_KEYWORDS.some(k => lowerText === k);
};

interface AssistantStep {
  field: string;
  question: string;
  type: 'text' | 'select' | 'date';
  options?: string[];
  optional?: boolean;
}

export const TASK_STEPS: AssistantStep[] = [
  { field: 'title', question: 'Qual é a tarefa?', type: 'text' },
  { field: 'unidade', question: 'Qual é a unidade?', type: 'select', options: UNITS },
  { field: 'solicitante', question: 'Quem é o solicitante?', type: 'select', options: SOLICITANTES },
  { field: 'status', question: 'Qual é o status?', type: 'select', options: ['Em andamento', 'Concluído'] },
  { field: 'entrega', question: 'Qual é a data de entrega?', type: 'date' },
];

export const BIRTHDAY_STEPS: AssistantStep[] = [
  { field: 'name', question: 'Qual é o nome?', type: 'text' },
  { field: 'unidade', question: 'Qual é a unidade?', type: 'select', options: UNITS },
  { field: 'data', question: 'Qual é a data?', type: 'date' },
  { field: 'status', question: 'Qual é o status?', type: 'select', options: ['Aguardando', 'Em andamento', 'Pronto'] },
  { field: 'foto', question: 'Deseja adicionar link da foto? (Opcional)', type: 'text', optional: true },
];

export const validateInput = (intent: AssistantIntent, step: number, value: string): string | null => {
  const steps = intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
  const currentStep = steps[step];

  if (!currentStep) return null;

  if (!value.trim() && !currentStep.optional) {
    return 'Este campo é obrigatório.';
  }

  if (currentStep.type === 'select' && currentStep.options) {
    const match = currentStep.options.find(opt => opt.toLowerCase() === value.toLowerCase().trim());
    if (!match) {
      return `Opção inválida. Escolha uma de: ${currentStep.options.join(', ')}`;
    }
    return null; // Valid
  }

  if (currentStep.type === 'date') {
    // Simple date validation (YYYY-MM-DD or DD/MM/YYYY)
    const dateRegex = /^(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})$/;
    if (!dateRegex.test(value.trim())) {
      return 'Formato de data inválido. Use AAAA-MM-DD ou DD/MM/AAAA.';
    }
  }

  return null;
};

export const formatValue = (intent: AssistantIntent, step: number, value: string): any => {
  const steps = intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
  const currentStep = steps[step];

  if (currentStep.type === 'select' && currentStep.options) {
    return currentStep.options.find(opt => opt.toLowerCase() === value.toLowerCase().trim()) || value;
  }

  if (currentStep.type === 'date') {
    if (value.includes('/')) {
      const [d, m, y] = value.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  return value;
};
