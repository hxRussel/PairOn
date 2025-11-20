
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Trash2, StopCircle, ArrowLeft, Smartphone, ChevronRight } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { PhoneData } from '../services/firebase';
import { Language } from '../types';
import { Loader } from './Loader';

interface AiAdvisorProps {
  savedPhones: PhoneData[];
  language: Language;
  isDark: boolean;
  userName: string;
  onBack: () => void;
  onViewPhone: (phone: PhoneData) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const MiniPhoneCard: React.FC<{ phone: PhoneData, onClick: () => void, isDark: boolean }> = ({ phone, onClick, isDark }) => (
  <div 
    onClick={onClick}
    className={`mt-3 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'}`}
  >
    <div className={`w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br ${phone.color} flex-shrink-0 flex items-center justify-center`}>
       {phone.imageUrl ? <img src={phone.imageUrl} className="w-full h-full object-cover" alt="" /> : <Smartphone size={20} className="text-white/50" />}
    </div>
    <div className="flex-1 min-w-0">
       <p className={`text-[10px] font-medium uppercase opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{phone.brand}</p>
       <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{phone.model}</p>
    </div>
    <div className={`p-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
       <ChevronRight size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
    </div>
  </div>
);

const AiAdvisor: React.FC<AiAdvisorProps> = ({ savedPhones, language, isDark, userName, onBack, onViewPhone }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    it: {
      title: "PairOn AI",
      subtitle: "Il tuo esperto personale.",
      placeholder: "Chiedimi un consiglio...",
      emptyState: "Ciao! Sono PairOn AI. Posso analizzare la tua collezione di smartphone e aiutarti a scegliere il migliore.",
      suggestions: [
        "Quale ha la batteria migliore?",
        "Miglior fotocamera per foto notturne?",
        "Quale ha il miglior rapporto qualità/prezzo?",
        "Confronta i display"
      ],
      disclaimer: "L'AI può commettere errori. Verifica le informazioni.",
      sending: "Sto analizzando...",
      clear: "Nuova Chat"
    },
    en: {
      title: "PairOn AI",
      subtitle: "Your personal expert.",
      placeholder: "Ask me for advice...",
      emptyState: "Hi! I'm PairOn AI. I can analyze your smartphone collection and help you pick the best one.",
      suggestions: [
        "Which has better battery life?",
        "Best camera for night shots?",
        "Best value for money?",
        "Compare displays"
      ],
      disclaimer: "AI can make mistakes. Please verify info.",
      sending: "Analyzing...",
      clear: "New Chat"
    }
  };

  const text = t[language];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Chat Session
  useEffect(() => {
    const initChat = async () => {
      if (!process.env.API_KEY) return;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct context from saved phones
      const phoneContext = savedPhones.map(p => ({
        id: p.id,
        model: `${p.brand} ${p.model}`,
        specs: {
          chip: p.chip,
          battery: p.battery?.capacity,
          charging: p.battery?.wiredCharging,
          display: p.displays?.[0] ? `${p.displays[0].size} ${p.displays[0].type} ${p.displays[0].refreshRate}` : 'N/A',
          cameras: p.cameras?.map(c => `${c.type} ${c.megapixels}`).join(', '),
          price: p.price,
          launch: p.launchDate
        }
      }));

      const systemInstruction = `
        You are PairOn AI, a helpful smartphone expert.
        The user is named ${userName}.
        
        CONTEXT:
        The user has saved the following smartphones in their collection:
        ${JSON.stringify(phoneContext)}
        
        INSTRUCTIONS:
        1. Answer questions based strictly on the provided smartphone list.
        2. If the user asks about a phone NOT in the list, you can use your general knowledge, but mention it's not in their saved list.
        3. Be concise, objective, and helpful.
        4. Format your answers nicely (use bullet points if comparing).
        5. Reply in ${language === 'it' ? 'Italian' : 'English'}.
        6. IMPORTANT: If you refer to a specific smartphone from the user's list as a suggestion or recommendation, you MUST append the following tag at the end of your response: [VIEW_ID: <id>]. Example: "The iPhone 15 has a great camera. [VIEW_ID: 12345]". If multiple phones are discussed/compared, append multiple tags like [VIEW_ID: 123][VIEW_ID: 456].
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      setChatSession(chat);
    };

    initChat();
  }, [savedPhones, language, userName]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !chatSession) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: content
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: content });
      
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || (language === 'it' ? "Non ho una risposta." : "I have no response."), 
      };

      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: language === 'it' ? "Scusa, ho avuto un problema tecnico. Riprova." : "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    window.location.reload(); 
  };

  return (
    <div className="flex flex-col h-screen pb-0 animate-fade-in absolute inset-0 z-40 bg-inherit">
      {/* Header with Back Button */}
      <div className={`px-6 pt-4 pb-2 flex justify-between items-center mt-safe ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
             <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-pairon-obsidian'}`}>
               <Sparkles className="text-pairon-mint" size={24} />
               {text.title}
             </h2>
             <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{text.subtitle}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={handleClearChat}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            title={text.clear}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pairon-indigo to-pairon-mint flex items-center justify-center mb-6 shadow-lg shadow-pairon-mint/20">
              <Bot size={32} className="text-white" />
            </div>
            <p className={`text-center max-w-xs mb-8 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {text.emptyState}
            </p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
              {text.suggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sugg)}
                  className={`p-3 rounded-xl text-sm font-medium text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300' : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm'}`}
                >
                  <span className="text-pairon-mint mr-2">✦</span> {sugg}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            // Parse IDs from text
            const viewIdRegex = /\[VIEW_ID:\s*([^\]]+)\]/g;
            const ids: string[] = [];
            let match;
            const originalText = msg.text || "";
            
            // Use matchAll or loop to get all IDs
            while ((match = viewIdRegex.exec(originalText)) !== null) {
               if(match[1]) ids.push(match[1].trim());
            }
            
            // Clean text for display
            const cleanText = originalText.replace(viewIdRegex, '').trim();

            return (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-pairon-indigo to-pairon-blue text-white rounded-tr-sm shadow-lg shadow-pairon-indigo/20' 
                    : (isDark ? 'bg-pairon-surface border border-white/10 text-gray-200 rounded-tl-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm')
                }`}>
                  {msg.role === 'model' && (
                     <div className="flex items-center gap-2 mb-2 opacity-50 border-b border-gray-500/20 pb-1">
                        <Bot size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">PairOn AI</span>
                     </div>
                  )}
                  {cleanText}
                  
                  {/* Interactive Cards */}
                  {ids.length > 0 && (
                     <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-500/10">
                        {ids.map((id, i) => {
                           const phone = savedPhones.find(p => p.id === id);
                           if(!phone) return null;
                           return (
                             <MiniPhoneCard 
                               key={`${id}-${i}`} 
                               phone={phone} 
                               onClick={() => onViewPhone(phone)} 
                               isDark={isDark} 
                             />
                           );
                        })}
                     </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className={`p-4 rounded-2xl rounded-tl-sm flex items-center gap-3 ${isDark ? 'bg-pairon-surface border border-white/10' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <Loader className="w-4 h-4 animate-spin text-pairon-mint" />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{text.sending}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      {messages.length > 0 && (
         <div className={`px-6 text-center py-1 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            {text.disclaimer}
         </div>
      )}

      {/* Input Area - Padding reduced since navbar is hidden */}
      <div className={`p-4 pb-8 px-6 ${isDark ? 'bg-pairon-obsidian' : 'bg-pairon-ghost'}`}>
        <div className={`flex items-center gap-2 p-2 rounded-[1.5rem] border transition-all focus-within:border-pairon-mint focus-within:ring-1 focus-within:ring-pairon-mint/20 ${isDark ? 'bg-pairon-surface border-white/10' : 'bg-white border-gray-200 shadow-lg shadow-gray-200/50'}`}>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder={text.placeholder}
            disabled={isLoading}
            className={`flex-1 bg-transparent px-4 py-2 outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
          <button 
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${inputValue.trim() && !isLoading ? 'bg-pairon-mint text-pairon-obsidian hover:scale-105 active:scale-95' : (isDark ? 'bg-white/10 text-gray-600' : 'bg-gray-100 text-gray-400')}`}
          >
            <Send size={18} className={inputValue.trim() && !isLoading ? 'translate-x-0.5 translate-y-0.5' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;
    