import { UnitInfo } from '../types';
import { loadSettings, saveSettings } from './settingsUtils';
import { loadTasks, saveTasks } from './taskUtils';
import { loadAniversariantes, saveAniversariantes } from './birthdayUtils';

const STORAGE_KEY = 'dashboard_unit_info';

export interface DynamicUnit {
  prefix: string;
  name: string;
}

export const DEFAULT_DYNAMIC_UNITS: DynamicUnit[] = [
  { prefix: 'ARA', name: 'Espaçolaser - Araripina' },
  { prefix: 'ST', name: 'Espaçolaser - Serra Talhada' },
  { prefix: 'GUS', name: 'Espaçolaser - Garanhuns' },
  { prefix: 'CZ', name: 'Espaçolaser - Cajazeiras' },
  { prefix: 'VSA', name: 'Espaçolaser - Vitória de Santo Antão' },
  { prefix: 'LIV', name: 'Espaçolaser - Santana do Livramento' },
  { prefix: 'MUR', name: 'Espaçolaser - Muriaé' },
  { prefix: 'VILH', name: 'Espaçolaser - Vilhena' },
  { prefix: 'COR', name: 'Espaçolaser - Corumbá' },
  { prefix: 'FOR', name: 'Espaçolaser - Fortaleza' },
  { prefix: 'MACS', name: 'Espaçolaser - Plaza Macaé' },
  { prefix: 'MACE', name: 'Espaçolaser - Centro Macaé' },
];

export const loadDynamicUnits = (): DynamicUnit[] => {
  const stored = localStorage.getItem('dashboard_dynamic_units');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading dynamic units:', e);
    }
  }
  localStorage.setItem('dashboard_dynamic_units', JSON.stringify(DEFAULT_DYNAMIC_UNITS));
  return DEFAULT_DYNAMIC_UNITS;
};

// Legacy export for backward compatibility with static imports
export let OFFICIAL_UNITS = loadDynamicUnits().map(u => ({ id: `EL - ${u.prefix}`, name: u.name }));

export const refreshOfficialUnits = () => {
  OFFICIAL_UNITS = loadDynamicUnits().map(u => ({ id: `EL - ${u.prefix}`, name: u.name }));
};

const generateDefaultData = (): Record<string, UnitInfo> => {
  const data: Record<string, UnitInfo> = {};
  const units = loadDynamicUnits();
  units.forEach(unit => {
    const unitId = `EL - ${unit.prefix}`;
    data[unitId] = {
      id: unitId,
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
  const units = loadDynamicUnits();
  
  let data: Record<string, UnitInfo> = {};
  if (stored) {
    try {
      data = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing unit info from localStorage', e);
      return generateDefaultData();
    }
  } else {
    return generateDefaultData();
  }
  
  // Ensure every dynamic unit has an entry in UnitInfo
  units.forEach(unit => {
    const unitId = `EL - ${unit.prefix}`;
    if (!data[unitId]) {
      data[unitId] = {
        id: unitId,
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
    } else {
      // Keep name updated if edited
      data[unitId].name = unit.name;
    }
  });
  
  return data;
};

export const saveUnitInfo = (data: Record<string, UnitInfo>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const renameUnitPrefix = (oldPrefix: string, newPrefix: string) => {
  if (oldPrefix === newPrefix) return;

  // Update tasks
  try {
    const tasks = loadTasks();
    let updated = false;
    const newTasks = tasks.map(t => {
      if (t.unidade === oldPrefix) {
        updated = true;
        return { ...t, unidade: newPrefix };
      }
      return t;
    });
    if (updated) {
      saveTasks(newTasks);
    }
  } catch (e) {
    console.error('Error renaming unit in tasks:', e);
  }

  // Update birthdays
  try {
    const birthdays = loadAniversariantes();
    let updated = false;
    const newBirthdays = birthdays.map(b => {
      if (b.unidade === oldPrefix) {
        updated = true;
        return { ...b, unidade: newPrefix };
      }
      return b;
    });
    if (updated) {
      saveAniversariantes(newBirthdays);
    }
  } catch (e) {
    console.error('Error renaming unit in birthdays:', e);
  }

  // Update UnitInfo key in dashboard_unit_info
  try {
    const unitInfoData = loadUnitInfo();
    const oldKey = `EL - ${oldPrefix}`;
    const newKey = `EL - ${newPrefix}`;
    if (unitInfoData[oldKey]) {
      const info = unitInfoData[oldKey];
      delete unitInfoData[oldKey];
      unitInfoData[newKey] = {
        ...info,
        id: newKey
      };
      saveUnitInfo(unitInfoData);
    }
  } catch (e) {
    console.error('Error renaming unit key in unitInfoData:', e);
  }
};

export const saveDynamicUnits = (units: DynamicUnit[]) => {
  localStorage.setItem('dashboard_dynamic_units', JSON.stringify(units));
  refreshOfficialUnits();

  // Update settings.unidades to keep colors and list of units in sync
  try {
    const settings = loadSettings();
    const updatedUnidades = units.map(u => {
      const existing = settings.unidades.find(su => su.name === u.prefix);
      return {
        id: u.prefix,
        name: u.prefix,
        color: existing ? existing.color : '#FFFFFF'
      };
    });
    saveSettings({ ...settings, unidades: updatedUnidades });
  } catch (e) {
    console.error('Error updating settings units:', e);
  }

  // Dispatch an event so components know settings/units changed
  window.dispatchEvent(new Event('settingsChanged'));
};
