// BACKUP OF /src/constants.ts as of 2026-04-01
import { AppSettings } from './types';

export const UNIT_COLORS: Record<string, string> = {
  'ARA': '#D7C65F',
  'ST': '#FF8A57',
  'GUS': '#2F80ED',
  'CZ': '#F6B6C1',
  'VSA': '#D85C84',
  'LIV': '#A07B73',
  'MUR': '#A8D94E',
  'VILH': '#6E4CCF',
  'COR': '#6F6FEA',
  'FOR': '#7DD3FC',
  'MACS': '#6AA8FF',
  'MACE': '#37A0D9',
  'TODAS': '#050714',
  'GUS + CZ': '#2F80ED',
  'PESSOAL': '#6B7280',
  'URGENTE': '#EF4444',
  'OUTROS': '#9CA3AF',
  'AGÊNCIA 087': '#10B981',
};

export const SOLICITANTE_COLORS: Record<string, string> = {
  'Priscila (ARA)': '#FF4FA3',
  'Natália': '#F28AD6',
  'Alice': '#F3B4D7',
  'Sabrina': '#8E6AD8',
  'Adriany': '#6C4CCF',
  'Carol': '#7A78E6',
  'Ana Laura': '#B784E8',
  'Jacque': '#D97DB8',
  'Tatiana': '#F59A9A',
  'Pamella': '#B59AF0',
  'Gleissi': '#4F79B8',
  'Ana Carla': '#8DC8F4',
  'Rebeca': '#35A56F',
  'Lia': '#2F80ED',
  'Raquel': '#36D399',
  'Nádia': '#D85C84',
  'Fran': '#9B69B0',
  'Márcio': '#49A7E8',
  'Evaristo': '#7CA6F8',
  'Adelino': '#1B6F78',
  'Eduardo': '#FF8A57',
  'Priscila (FOR)': '#A8D94E',
  'SÓCIOS': '#F2D33B',
  'Fritz': '#E56A86',
};

export const SOLICITANTES = Object.keys(SOLICITANTE_COLORS);
export const UNITS = Object.keys(UNIT_COLORS);

export const getContrastColor = (hexColor: string) => {
  if (!hexColor || hexColor === 'transparent') return '#000000';
  
  const hex = hexColor.replace('#', '');
  
  if (hex.length !== 6) return '#000000';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  return yiq >= 128 ? '#000000' : '#FFFFFF';
};

export const DEFAULT_SETTINGS: AppSettings = {
  solicitantes: SOLICITANTES.map(name => ({ id: name, name, color: SOLICITANTE_COLORS[name] })),
  unidades: UNITS.map(name => ({ id: name, name, color: UNIT_COLORS[name] })),
  statusPauta: [
    { id: 'Em andamento', name: 'Em andamento', color: '#FDBA74' },
    { id: 'Concluído', name: 'Concluído', color: '#3B82F6' }
  ],
  statusAniversariantes: [
    { id: 'Aguardando', name: 'Aguardando', color: '#050714' },
    { id: 'Em andamento', name: 'Em andamento', color: '#FDBA74' },
    { id: 'Pronto', name: 'Pronto', color: '#3B82F6' }
  ]
};
