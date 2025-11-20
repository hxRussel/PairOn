import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Helper function to safely retrieve the API key in various environments (Vite, Node, etc.)
const getApiKey = (): string => {
  // 1. Try Vite/Vercel standard environment variable
  // @ts-ignore - import.meta.env is available in Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // 2. Try standard Node.js environment variable (fallback)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // process is not defined
  }

  return '';
};

// Initialize Gemini API client
// Note: On Vercel, ensure you have set the Environment Variable 'VITE_API_KEY'
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getSmartphoneComparison = async (phone1: string, phone2: string, lang: Language = 'it'): Promise<string> => {
  if (!phone1 || !phone2) return lang === 'it' ? "Per favore inserisci entrambi i modelli di telefono." : "Please enter both phone models.";

  try {
    const model = 'gemini-2.5-flash'; // Using Flash for speed on the login preview
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'it' ? "Si è verificato un errore durante la connessione all'assistente AI." : "An error occurred while connecting to the AI assistant.";
  }
};

export const getWelcomeMessage = async (lang: Language): Promise<string> => {
  try {
    const langName = lang === 'it' ? 'Italian' : 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, witty, 1-sentence welcome message for a smartphone comparison app named 'PairOn' in ${langName}.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text || (lang === 'it' ? "Benvenuto su PairOn!" : "Welcome to PairOn!");
  } catch (error) {
    return lang === 'it' ? "Trova il tuo smartphone ideale." : "Find your perfect smartphone.";
  }
}