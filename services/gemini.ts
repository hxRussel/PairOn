
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Helper to get the client strictly from process.env.API_KEY as per guidelines
const getAiClient = () => {
  // Strictly following guidelines to use process.env.API_KEY
  // @ts-ignore
  const key = process.env.API_KEY;
  
  console.log("Gemini Service: Initializing client...");
  
  if (!key) {
    console.error("Gemini Service CRITICAL ERROR: process.env.API_KEY is missing.");
    console.warn("Troubleshooting: If you are on Vercel/Vite, ensure 'API_KEY' is set in your Vercel Project Settings environment variables.");
    throw new Error("API Key missing. Please check process.env.API_KEY configuration.");
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
      return lang === 'it' ? "Errore: Chiave API non valida o mancante." : "Config Error: API Key missing.";
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
