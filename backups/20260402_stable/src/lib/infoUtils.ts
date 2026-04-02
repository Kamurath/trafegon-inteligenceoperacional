import { UnitInfo } from '../types';

const STORAGE_KEY = 'dashboard_unit_info';

export const OFFICIAL_UNITS = [
  { id: 'EL - ARA', name: 'Espa\u00e7olaser - Araripina' },
  { id: 'EL - ST', name: 'Espa\u00e7olaser - Serra Talhada' },
  { id: 'EL - GUS', name: 'Espa\u00e7olaser - Garanhuns' },
  { id: 'EL - CZ', name: 'Espa\u00e7olaser - Cajazeiras' },
  { id: 'EL - VSA', name: 'Espa\u00e7olaser - Vit\u00f3ria de Santo Ant\u00e3o' },
  { id: 'EL - LIV', name: 'Espa\u00e7olaser - Santana do Livramento' },
  { id: 'EL - MUR', name: 'Espa\u00e7olaser - Muria\u00e9' },
  { id: 'EL - VIL', name: 'Espa\u00e7olaser - Vilhena' },
  { id: 'EL - COR', name: 'Espa\u00e7olaser - Corumb\u00e1' },
  { id: 'EL - FOR', name: 'Espa\u00e7olaser - Fortaleza' },
  { id: 'EL - MACS', name: 'Espa\u00e7olaser - Plaza Maca\u00e9' },
  { id: 'EL - MACE', name: 'Espa\u00e7olaser - Centro Maca\u00e9' },
];

const generateDefaultData = (): Record<string, UnitInfo> => {
  const data: Record<string, UnitInfo> = {};
  OFFICIAL_UNITS.forEach(unit => {
    data[unit.id] = {
      id: unit.id,
      name: unit.name,
      funcionamento: 'Segunda a Sexta: 08h \u00e0s 20h | S\u00e1bado: 08h \u00e0s 14h',
      contatos: '(87) 99999-9999 | (87) 3831-0000',
      whatsappBio: 'https://wa.me/5587999999999',
      whatsappTrafego: 'https://wa.me/5587988888888',
      cnpj: '00.000.000/0001-00',
      razaoSocial: `${unit.name} LTDA`,
      endereco: 'Rua Exemplo, 123 - Centro, Cidade - UF',
      contatoSocio: 'S\u00f3cio Exemplo - (87) 97777-7777',
      enderecoSocio: 'Rua do S\u00f3cio, 456 - Bairro, Cidade - UF',
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
