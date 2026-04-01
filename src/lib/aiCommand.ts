import { GoogleGenAI, Type } from "@google/genai";
import { AIAction } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `
Você é um assistente de dashboard que interpreta comandos do usuário e os transforma em ações JSON estruturadas.
O dashboard possui três telas: 'pauta' (tarefas), 'aniversariantes' e 'informacoes' (unidades).

As unidades oficiais são:
EL - ARA, EL - ST, EL - GUS, EL - CZ, EL - VSA, EL - LIV, EL - MUR, EL - VIL, EL - COR, EL - FOR, EL - MACS, EL - MACE.

Tipos de ações permitidas:
- create_task: { title, unidade, solicitante, status, entrega, posicao }
- update_task_status: { taskId, status }
- delete_task: { taskId }
- create_birthday: { name, unidade, foto, status, data, posicao }
- update_birthday_status: { birthdayId, status }
- delete_birthday: { birthdayId }
- update_unit_info: { unitId, field, value }
- search: { query }

Regras:
1. Responda APENAS com o JSON.
2. Se não for um comando claro de ação, retorne type: "search" com o texto original.
3. Use os nomes das unidades exatamente como fornecido.
4. Se o usuário mencionar um número de tarefa/aniversariante (ex: "tarefa 3"), use esse número como ID (ex: "3").
5. Não escreva explicações.
`;

export async function interpretCommand(text: string, currentPage: string): Promise<AIAction> {
  if (!apiKey) {
    return { type: 'search', payload: { query: text } };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Contexto atual: tela ${currentPage}. Comando: "${text}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            payload: { type: Type.OBJECT }
          },
          required: ["type", "payload"]
        }
      },
    });

    const result = JSON.parse(response.text);
    return result as AIAction;
  } catch (error) {
    console.error("AI Command Error:", error);
    return { type: 'search', payload: { query: text } };
  }
}
