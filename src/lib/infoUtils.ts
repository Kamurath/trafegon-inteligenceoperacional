import { UnitInfo } from '../types';

const STORAGE_KEY = 'dashboard_unit_info';

export const OFFICIAL_UNITS = [
  { id: 'EL - ARA', name: 'Espaçolaser - Araripina' },
  { id: 'EL - ST', name: 'Espaçolaser - Serra Talhada' },
  { id: 'EL - GUS', name: 'Espaçolaser - Garanhuns' },
  { id: 'EL - CZ', name: 'Espaçolaser - Cajazeiras' },
  { id: 'EL - VSA', name: 'Espaçolaser - Vitória de Santo Antão' },
  { id: 'EL - LIV', name: 'Espaçolaser - Santana do Livramento' },
  { id: 'EL - MUR', name: 'Espaçolaser - Muriaé' },
  { id: 'EL - VIL', name: 'Espaçolaser - Vilhena' },
  { id: 'EL - COR', name: 'Espaçolaser - Corumbá' },
  { id: 'EL - FOR', name: 'Espaçolaser - Fortaleza' },
  { id: 'EL - MACS', name: 'Espaçolaser - Plaza Macaé' },
  { id: 'EL - MACE', name: 'Espaçolaser - Centro Macaé' },
];

const generateDefaultData = (): Record<string, UnitInfo> => {
  const data: Record<string, UnitInfo> = {};
  OFFICIAL_UNITS.forEach(unit => {
    data[unit.id] = {
      id: unit.id,
      name: unit.name,
      funcionamento: 'Segunda a Sexta: 08h às 20h | Sábado: 08h às 14h',
      contatos: '(87) 99999-9999 | (87) 3831-0000',
      whatsappBio: 'https://wa.me/5587999999999',
      whatsappTrafego: 'https://wa.me/5587988888888',
      cnpj: '00.000.000/0001-00',
      razaoSocial: `${unit.name} LTDA`,
      endereco: 'Rua Exemplo, 123 - Centro, Cidade - UF',
      contatoSocio: 'Sócio Exemplo - (87) 97777-7777',
      enderecoSocio: 'Rua do Sócio, 456 - Bairro, Cidade - UF',
      documentosLink: 'https://drive.google.com/drive/folders/example',
    };
  });
  return data;
};

export const loadUnitInfo = (): Record<string, UnitInfo> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing unit info from localStorage', e);
      return generateDefaultData();
    }
  }
  return generateDefaultData();
};

export const saveUnitInfo = (data: Record<string, UnitInfo>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
