import { GoogleGenAI, Type } from "@google/genai";
import { AIAction } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `
Voc\u00ea \u00e9 um assistente de dashboard que interpreta comandos do usu\u00e1rio e os transforma em a\u00e7\u00f5es JSON estruturadas.
O dashboard possui tr\u00eas telas: 'pauta' (tarefas), 'aniversariantes' e 'informacoes' (unidades).

As unidades oficiais s\u00e3o:
EL - ARA, EL - ST, EL - GUS, EL - CZ, EL - VSA, EL - LIV, EL - MUR, EL - VIL, EL - COR, EL - FOR, EL - MACS, EL - MACE.

Tipos de a\u00e7\u00f5es permitidas:
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
2. Se n\u00e3o for um comando claro de a\u00e7\u00e3o, retorne type: "search" com o texto original.
3. Use os nomes das unidades exatamente como fornecido.
4. Se o usu\u00e1rio mencionar um n\u00famero de tarefa/aniversariante (ex: "tarefa 3"), use esse n\u00famero como ID (ex: "3").
5. N\u00e3o escreva explica\u00e7\u00f5es.
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
