import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Helper to get the client safely supporting multiple build environments
const getAiClient = () => {
  // Prioritize strict process.env.API_KEY but fallback to VITE_ and REACT_APP_ prefixes
  // which are required for client-side visibility in Vercel/Netlify deployments.
  const key = process.env.API_KEY || 
              // @ts-ignore - Handle Vite types potentially not being present
              (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_KEY : undefined) ||
              process.env.REACT_APP_API_KEY;
  
  if (!key) {
    console.error("GEMINI API KEY MISSING");
    throw new Error("API Key not found. Please check Vercel Settings -> Environment Variables. Ensure you have added 'VITE_API_KEY'.");
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
      return lang === 'it' ? "Errore Configurazione: API Key mancante o non valida su Vercel." : "Config Error: API Key missing or invalid on Vercel.";
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