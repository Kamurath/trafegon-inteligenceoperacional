// BACKUP OF /src/lib/birthdayUtils.ts as of 2026-04-01
import { Aniversariante } from '../types';

const STORAGE_KEY = 'dashboard_aniversariantes_v2';

const DEFAULT_ANIVERSARIANTES: Aniversariante[] = [
  { id: '1', name: 'Ana Luiza', unidade: 'MUR', data: '2026-04-11', status: 'Aguardando', foto: '', posicao: '' },
  { id: '2', name: 'Yasmin', unidade: 'VSA', data: '2026-04-12', status: 'Aguardando', foto: '', posicao: '' },
  { id: '3', name: 'Joice', unidade: 'ARA', data: '2026-04-12', status: 'Aguardando', foto: '', posicao: '' },
  { id: '4', name: 'Erika', unidade: 'VSA', data: '2026-04-15', status: 'Aguardando', foto: '', posicao: '' },
  { id: '5', name: 'Amanda', unidade: 'ST', data: '2026-04-15', status: 'Aguardando', foto: '', posicao: '' },
  { id: '6', name: 'Ana Laura', unidade: 'MUR', data: '2026-04-27', status: 'Aguardando', foto: '', posicao: '' },
  { id: '7', name: 'Ellem', unidade: 'CZ', data: '2026-04-29', status: 'Aguardando', foto: '', posicao: '' },
  { id: '8', name: 'Pâmella', unidade: 'FOR', data: '2026-05-01', status: 'Aguardando', foto: '', posicao: '' },
  { id: '9', name: 'Julia', unidade: 'VILH', data: '2026-05-15', status: 'Aguardando', foto: '', posicao: '' },
  { id: '10', name: 'Mayra', unidade: 'VSA', data: '2026-05-18', status: 'Aguardando', foto: '', posicao: '' },
  { id: '11', name: 'Nicole', unidade: 'ARA', data: '2026-05-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '12', name: 'Camila', unidade: 'VILH', data: '2026-05-30', status: 'Aguardando', foto: '', posicao: '' },
  { id: '13', name: 'Sabrina', unidade: 'CZ', data: '2026-06-01', status: 'Aguardando', foto: '', posicao: '' },
  { id: '14', name: 'Rebeca', unidade: 'ST', data: '2026-06-04', status: 'Aguardando', foto: '', posicao: '' },
  { id: '15', name: 'Renata', unidade: 'MACS', data: '2026-06-08', status: 'Aguardando', foto: '', posicao: '' },
  { id: '16', name: 'Nthalyya', unidade: 'MACS', data: '2026-06-12', status: 'Aguardando', foto: '', posicao: '' },
  { id: '17', name: 'Jacqueline', unidade: 'VILH', data: '2026-06-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '18', name: 'Sara', unidade: 'CZ', data: '2026-08-06', status: 'Aguardando', foto: '', posicao: '' },
  { id: '19', name: 'Sandi', unidade: 'FOR', data: '2026-08-10', status: 'Aguardando', foto: '', posicao: '' },
  { id: '20', name: 'Ester', unidade: 'GUS', data: '2026-08-13', status: 'Aguardando', foto: '', posicao: '' },
  { id: '21', name: 'Thays', unidade: 'COR', data: '2026-08-15', status: 'Aguardando', foto: '', posicao: '' },
  { id: '22', name: 'Gabi', unidade: 'ARA', data: '2026-08-16', status: 'Aguardando', foto: '', posicao: '' },
  { id: '23', name: 'Alice', unidade: 'GUS', data: '2026-08-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '24', name: 'Vanessa Borges', unidade: 'FOR', data: '2026-08-22', status: 'Aguardando', foto: '', posicao: '' },
  { id: '25', name: 'Nádia (Sócia)', unidade: 'VILH', data: '2026-08-25', status: 'Aguardando', foto: '', posicao: '' },
  { id: '26', name: 'Giovanna', unidade: 'COR', data: '2026-08-31', status: 'Aguardando', foto: '', posicao: '' },
  { id: '27', name: 'Nara', unidade: 'VSA', data: '2026-09-12', status: 'Aguardando', foto: '', posicao: '' },
  { id: '28', name: 'Lia', unidade: 'ARA', data: '2026-09-12', status: 'Aguardando', foto: '', posicao: '' },
  { id: '29', name: 'Leonir', unidade: 'FOR', data: '2026-09-13', status: 'Aguardando', foto: '', posicao: '' },
  { id: '30', name: 'Thalia', unidade: 'ST', data: '2026-09-17', status: 'Aguardando', foto: '', posicao: '' },
  { id: '31', name: 'Maria de Fátima', unidade: 'CZ', data: '2026-09-18', status: 'Aguardando', foto: '', posicao: '' },
  { id: '32', name: 'Ianara', unidade: 'ARA', data: '2026-09-18', status: 'Aguardando', foto: '', posicao: '' },
  { id: '33', name: 'Dra Cíntia (Sócia)', unidade: 'FOR', data: '2026-09-28', status: 'Aguardando', foto: '', posicao: '' },
  { id: '34', name: 'Maira', unidade: 'GUS', data: '2026-09-29', status: 'Aguardando', foto: '', posicao: '' },
  { id: '35', name: 'Lorrany', unidade: 'MACS', data: '2026-10-01', status: 'Aguardando', foto: '', posicao: '' },
  { id: '36', name: 'Franciele', unidade: 'ST', data: '2026-10-06', status: 'Aguardando', foto: '', posicao: '' },
  { id: '37', name: 'Mileide', unidade: 'VSA', data: '2026-10-09', status: 'Aguardando', foto: '', posicao: '' },
  { id: '38', name: 'Renata', unidade: 'LIV', data: '2026-10-11', status: 'Aguardando', foto: '', posicao: '' },
  { id: '39', name: 'Daianny', unidade: 'COR', data: '2026-10-12', status: 'Aguardando', foto: '', posicao: '' },
  { id: '40', name: 'Marja Larissa', unidade: 'MACE', data: '2026-10-14', status: 'Aguardando', foto: '', posicao: '' },
  { id: '41', name: 'Deborah', unidade: 'MACS', data: '2026-10-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '42', name: 'Mayara', unidade: 'MUR', data: '2026-11-16', status: 'Aguardando', foto: '', posicao: '' },
  { id: '43', name: 'Juliana', unidade: 'LIV', data: '2026-11-18', status: 'Aguardando', foto: '', posicao: '' },
  { id: '44', name: 'Mirian', unidade: 'ARA', data: '2026-11-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '45', name: 'Luana', unidade: 'MACS', data: '2026-11-22', status: 'Aguardando', foto: '', posicao: '' },
  { id: '46', name: 'Raquel - Sócia', unidade: 'GUS', data: '2026-11-26', status: 'Aguardando', foto: '', posicao: '' },
  { id: '47', name: 'Mariane', unidade: 'MACE', data: '2026-11-28', status: 'Aguardando', foto: '', posicao: '' },
  { id: '48', name: 'Tatiana', unidade: 'COR', data: '2026-12-04', status: 'Aguardando', foto: '', posicao: '' },
  { id: '49', name: 'Dra Priscila (Sócia)', unidade: 'FOR', data: '2026-12-09', status: 'Aguardando', foto: '', posicao: '' },
  { id: '50', name: 'Natália', unidade: 'ST', data: '2026-12-17', status: 'Aguardando', foto: '', posicao: '' },
  { id: '51', name: 'Samara', unidade: 'FOR', data: '2026-12-19', status: 'Aguardando', foto: '', posicao: '' },
  { id: '52', name: 'Ana Carla', unidade: 'MACE', data: '2026-12-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '53', name: 'Val', unidade: 'FOR', data: '2026-12-21', status: 'Aguardando', foto: '', posicao: '' },
  { id: '54', name: 'Daiane', unidade: 'VILH', data: '2026-12-31', status: 'Aguardando', foto: '', posicao: '' },
  { id: '55', name: 'Natália', unidade: 'LIV', data: '2027-01-09', status: 'Aguardando', foto: '', posicao: '' },
  { id: '56', name: 'Narcisa', unidade: 'MACE', data: '2027-01-13', status: 'Aguardando', foto: '', posicao: '' },
  { id: '57', name: 'Michelly', unidade: 'CZ', data: '2027-01-16', status: 'Aguardando', foto: '', posicao: '' },
  { id: '58', name: 'Vanessa Freitas', unidade: 'FOR', data: '2027-01-18', status: 'Aguardando', foto: '', posicao: '' },
  { id: '59', name: 'Aline', unidade: 'MUR', data: '2027-01-26', status: 'Aguardando', foto: '', posicao: '' },
  { id: '60', name: 'Eduardo (Sócio)', unidade: 'FOR', data: '2027-01-28', status: 'Aguardando', foto: '', posicao: '' },
  { id: '61', name: 'Rafael (Sócio)', unidade: 'FOR', data: '2027-02-07', status: 'Aguardando', foto: '', posicao: '' },
  { id: '62', name: 'Kessiana', unidade: 'FOR', data: '2027-02-08', status: 'Aguardando', foto: '', posicao: '' },
  { id: '63', name: 'Eduarda', unidade: 'CZ', data: '2027-02-17', status: 'Aguardando', foto: '', posicao: '' },
  { id: '64', name: 'Victor', unidade: 'ARA', data: '2027-02-19', status: 'Aguardando', foto: '', posicao: '' },
  { id: '65', name: 'Vitória', unidade: 'GUS', data: '2027-02-20', status: 'Aguardando', foto: '', posicao: '' },
  { id: '66', name: 'Dayse', unidade: 'ST', data: '2027-02-26', status: 'Aguardando', foto: '', posicao: '' },
  { id: '67', name: 'Carol', unidade: 'MUR', data: '2027-03-02', status: 'Aguardando', foto: '', posicao: '' },
  { id: '68', name: 'Isadora', unidade: 'LIV', data: '2027-03-06', status: 'Aguardando', foto: '', posicao: '' },
  { id: '69', name: 'Mary', unidade: 'ST', data: '2027-03-07', status: 'Aguardando', foto: '', posicao: '' },
  { id: '70', name: 'Rhayssa', unidade: 'MUR', data: '2027-03-08', status: 'Aguardando', foto: '', posicao: '' },
  { id: '71', name: 'Priscila', unidade: 'ARA', data: '2027-03-09', status: 'Aguardando', foto: '', posicao: '' },
  { id: '72', name: 'Caroline', unidade: 'LIV', data: '2027-03-23', status: 'Aguardando', foto: '', posicao: '' },
  { id: '73', name: 'Chrystianne', unidade: 'CZ', data: '2027-03-22', status: 'Aguardando', foto: '', posicao: '' },
];

export const loadAniversariantes = (): Aniversariante[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Migration: Rename 'entrega' to 'data'
      return data.map((item: any) => {
        if (item.entrega && !item.data) {
          const { entrega, ...rest } = item;
          return { ...rest, data: entrega };
        }
        return item;
      });
    } catch (e) {
      console.error('Error parsing aniversariantes from localStorage', e);
    }
  }

  // Migration: Check for v1 if v2 is empty
  const v1Stored = localStorage.getItem('dashboard_aniversariantes_v1');
  if (v1Stored) {
    try {
      const data = JSON.parse(v1Stored);
      // Save to v2 for future use
      localStorage.setItem(STORAGE_KEY, v1Stored);
      return data;
    } catch (e) {
      console.error('Error migrating birthdays from v1:', e);
    }
  }

  return DEFAULT_ANIVERSARIANTES;
};

export const saveAniversariantes = (aniversariantes: Aniversariante[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(aniversariantes));
};
