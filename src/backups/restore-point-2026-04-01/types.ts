// BACKUP OF /src/types/index.ts as of 2026-04-01
export type Page = 'pauta' | 'aniversariantes' | 'informacoes' | 'configuracoes';

export interface Task {
  id: string;
  title: string;
  unidade: string;
  solicitante: string;
  status: 'Concluído' | 'Em andamento';
  entrega: string;
  originalEntrega?: string;
  posicao: string;
}

export interface Aniversariante {
  id: string;
  name: string;
  unidade: string;
  foto: string;
  status: 'Pronto' | 'Em andamento' | 'Aguardando';
  data: string;
  posicao: string;
}

export interface Informacao {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface UnitInfo {
  id: string;
  name: string;
  funcionamento: string;
  contatos: string;
  whatsappBio: string;
  whatsappTrafego: string;
  cnpj: string;
  razaoSocial: string;
  endereco: string;
  contatoSocio: string;
  enderecoSocio: string;
  documentosLink: string;
}

export interface SettingItem {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  solicitantes: SettingItem[];
  unidades: SettingItem[];
  statusPauta: SettingItem[];
  statusAniversariantes: SettingItem[];
}

export interface AppData {
  tasks: Task[];
  birthdays: Aniversariante[];
  units: Record<string, UnitInfo>;
  lastManualBackup?: string; // ISO Date
}

export interface BackupSnapshot {
  id: string;
  createdAt: string;
  data: AppData;
}

export type AIActionType = 
  | 'create_task' 
  | 'update_task_status' 
  | 'delete_task' 
  | 'create_birthday' 
  | 'update_birthday_status' 
  | 'delete_birthday' 
  | 'update_unit_info' 
  | 'search';

export interface AIAction {
  type: AIActionType;
  payload: any;
}
