
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Helper to get the client with prioritized environment variable checks
const getAiClient = () => {
  console.log("Gemini Service: Initializing client...");

  // 1. Try VITE_API_KEY (Standard for Vite/React apps)
  // 2. Try process.env.VITE_API_KEY (Sometimes populated by Vercel)
  // 3. Fallback to process.env.API_KEY (Standard Node)
  // @ts-ignore
  const key = import.meta.env?.VITE_API_KEY || process.env?.VITE_API_KEY || process.env?.API_KEY;
  
  if (!key) {
    console.error("Gemini Service CRITICAL ERROR: API Key is missing.");
    console.warn("Troubleshooting:");
    console.warn("1. Vercel: Ensure you have a variable named 'VITE_API_KEY' in Project Settings.");
    console.warn("2. Local: Ensure you have 'VITE_API_KEY=...' in your .env file.");
    console.log("Environment Check:", {
      // @ts-ignore
      hasMetaEnv: !!import.meta.env?.VITE_API_KEY,
      // @ts-ignore
      hasProcessVite: !!process.env?.VITE_API_KEY,
      // @ts-ignore
      hasProcessStd: !!process.env?.API_KEY
    });
    throw new Error("API Key missing. Please check VITE_API_KEY configuration in Vercel.");
  } else {
    console.log("Gemini Service: API Key found and loaded.");
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
    console.error("Gemini API Error in getSmartphoneComparison:", error);
    if (error.message && (error.message.includes("API Key") || error.message.includes("403"))) {
      return lang === 'it' ? "Errore Configurazione: Chiave API non trovata (VITE_API_KEY)." : "Config Error: API Key missing (VITE_API_KEY).";
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
