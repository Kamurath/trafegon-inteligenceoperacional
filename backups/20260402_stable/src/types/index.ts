export interface Task {
  id: string;
  title: string;
  unidade: string;
  solicitante: string;
  status: 'Em andamento' | 'Conclu\u00eddo' | 'Atrasado';
  entrega: string;
  posicao: string;
  originalEntrega?: string;
}

export interface Birthday {
  id: string;
  name: string;
  date: string;
  unit: string;
  role: string;
  photo?: string;
}

export interface UnitInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  email: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface AppSettings {
  unidades: { id: string; name: string; color: string }[];
  solicitantes: { id: string; name: string; color: string }[];
  statusPauta: { id: string; name: string; color: string }[];
  theme: 'light' | 'dark' | 'system';
}

export interface AppData {
  tasks: Task[];
  birthdays: Birthday[];
  units: UnitInfo[];
  settings?: AppSettings;
}
