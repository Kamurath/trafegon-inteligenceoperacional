// BACKUP OF /src/lib/aiCommand.ts as of 2026-04-01
import { AIAction } from '../types';

/**
 * Interpreta comandos de voz ou texto e retorna a ação correspondente.
 * Esta versão foi simplificada para remover a dependência da API Gemini
 * e focar em comandos locais e busca.
 */
export const interpretCommand = async (input: string): Promise<AIAction> => {
  const text = input.toLowerCase().trim();

  // Busca padrão se não houver comando reconhecido
  return {
    type: 'search',
    payload: { query: input }
  };
};
