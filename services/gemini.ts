import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Initialize Gemini API client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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