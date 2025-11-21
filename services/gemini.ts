import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Helper to get the client safely supporting multiple build environments
const getAiClient = () => {
  let key = '';

  // 1. Try Vite Standard (import.meta.env) - This is the standard for Vercel + Vite
  // We check this FIRST because process.env might be empty in the browser
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing import.meta", e);
  }

  // 2. Fallback to process.env (Legacy/Node compatibility)
  if (!key && typeof process !== 'undefined' && process.env) {
    key = process.env.API_KEY || process.env.REACT_APP_API_KEY || process.env.VITE_API_KEY || '';
  }
  
  if (!key) {
    console.error("GEMINI API KEY MISSING. Checked: import.meta.env.VITE_API_KEY and process.env.API_KEY");
    throw new Error("API Key mancante. IMPORTANTE: Dopo aver aggiunto la chiave su Vercel, devi fare il REDEPLOY.");
  }

  return new GoogleGenAI({ apiKey: key });
};

export const getSmartphoneComparison = async (phone1: string, phone2: string, lang: Language = 'it'): Promise<string> => {
  if (!phone1 || !phone2) return lang === 'it' ? "Per favore inserisci entrambi i modelli di telefono." : "Please enter both phone models.";

  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    const langName = lang === 'it' ? 'Italian' : 'English';
    const prompt = `Compare ${phone1} vs ${phone2} in 2 concise sentences. Focus on the main differentiator. Reply in ${langName}.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || (lang === 'it' ? "Non sono riuscito a generare un confronto al momento." : "Could not generate a comparison at this time.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && (error.message.includes("API Key") || error.message.includes("403"))) {
      return lang === 'it' ? "Errore: Chiave API non valida o mancante. Fai un Redeploy su Vercel." : "Config Error: API Key missing. Please Redeploy on Vercel.";
    }
    return lang === 'it' ? "Si è verificato un errore durante la connessione all'assistente AI." : "An error occurred while connecting to the AI assistant.";
  }
};

// Export a way to get the client for the Chat component
export const createChatSession = (systemInstruction: string) => {
  try {
    const ai = getAiClient();
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
  } catch (error) {
    console.error("Failed to create chat session:", error);
    throw error;
  }
};