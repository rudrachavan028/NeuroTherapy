import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/progressService';
import { Send, X, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface TherapistChatProps {
  onClose: () => void;
}

export const TherapistChat: React.FC<TherapistChatProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;

      try {
        // 1. Fetch User History
        const history = await progressService.getHistory(user.id);
        
        // 2. Summarize History for Context
        const recentHistory = history.slice(0, 10).map(h => 
          `- Played ${h.game_id} on ${new Date(h.played_at).toLocaleDateString()} (Score: ${h.score})`
        ).join('\n');

        const contextPrompt = `
          User Profile:
          - Name: ${user.name}
          - PTSD Level: ${user.ptsdLevel || 'Unknown'}
          - Assessment Completed: ${user.assessmentCompleted ? 'Yes' : 'No'}

          Recent Activity:
          ${recentHistory || 'No recent activity recorded.'}
        `;

        const systemInstruction = `
          You are an empathetic, professional, and supportive AI Therapist integrated into a neuro-therapy application.
          Your goal is to help the user manage their PTSD symptoms, reflect on their progress, and provide grounding techniques.
          
          Here is the user's context:
          ${contextPrompt}

          Guidelines:
          - Be compassionate, non-judgmental, and patient.
          - Use the user's name occasionally to build rapport.
          - Reference their recent game activity if relevant (e.g., "I see you've been practicing breathing exercises...").
          - If the user seems distressed, suggest immediate grounding techniques (5-4-3-2-1, deep breathing).
          - Keep responses concise (2-3 sentences usually) unless a deeper explanation is needed.
          - Do NOT diagnose medical conditions. Always encourage professional help for severe crises.
        `;

        // 3. Initialize Gemini
        // NOTE: In a real production app, this key should be proxied or strictly limited.
        // For this demo/preview, we use the environment variable.
        
        let apiKey: string | undefined;
        try {
            apiKey = process.env.GEMINI_API_KEY;
        } catch (e) {
            console.error("Error accessing process.env:", e);
        }

        if (!apiKey) {
            console.error("Gemini API Key is missing!");
            setMessages([{
                id: 'error',
                role: 'model',
                text: "I'm having trouble connecting right now. API Key is missing.",
                timestamp: new Date()
            }]);
            setIsInitializing(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Correct usage: ai.chats.create
        const chat = ai.chats.create({
            model: "gemini-3-flash-preview",
            config: {
                systemInstruction: systemInstruction,
            },
            history: [
                {
                    role: "user",
                    parts: [{ text: "Hello, I'm ready to talk." }],
                },
                {
                    role: "model",
                    parts: [{ text: `Hello ${user.name}. I'm here to support you. How are you feeling today?` }],
                },
            ],
        });

        chatSessionRef.current = chat;
        
        // Set initial greeting
        setMessages([
            {
                id: 'init',
                role: 'model',
                text: `Hello ${user.name}. I'm here to support you. How are you feeling today?`,
                timestamp: new Date()
            }
        ]);
      } catch (error: any) {
        console.error("Failed to init chat:", error);
        setMessages([{
            id: 'error',
            role: 'model',
            text: `I'm having trouble connecting. Error: ${error.message || 'Unknown error'}`,
            timestamp: new Date()
        }]);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      let fullText = '';
      for await (const chunk of responseStream) {
        const c = chunk as any;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm sorry, I couldn't process that. Could you please repeat?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Therapist</h2>
              <p className="text-indigo-200 text-xs">Always here to listen</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <p>Connecting to your personal therapist...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }
                  `}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-2 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 px-3"
              disabled={isLoading || isInitializing}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || isInitializing}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
