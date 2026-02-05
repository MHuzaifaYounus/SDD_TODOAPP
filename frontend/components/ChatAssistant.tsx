
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Conversation } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { geminiService } from '../services/geminiService.ts';

interface ChatAssistantProps {
  user: User;
  onClose: () => void;
  onTasksRefresh: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ user, onClose, onTasksRefresh }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const convs = await dbService.getConversations(user.id);
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConv(convs[0]);
      } else {
        const newConv = await dbService.createConversation(user.id, "Productivity Session");
        setConversations([newConv]);
        setActiveConv(newConv);
      }
    };
    initChat();
  }, [user.id]);

  useEffect(() => {
    if (activeConv) {
      dbService.getMessages(activeConv.id).then(setMessages);
    }
  }, [activeConv]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConv || isLoading) return;
    
    const userMsgContent = input;
    setInput('');
    setIsLoading(true);

    try {
      // Optimistic user update
      const tempUserMsg: Message = { id: Date.now().toString(), conversationId: activeConv.id, role: 'user', content: userMsgContent, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, tempUserMsg]);

      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Pass onTasksRefresh to geminiService for real-time tool turn updates
      const { content: aiResponse, toolUsed } = await geminiService.chatWithAgent(
        user.id, 
        activeConv.id, 
        userMsgContent, 
        history,
        onTasksRefresh
      );
      
      const tempAiMsg: Message = { id: (Date.now() + 1).toString(), conversationId: activeConv.id, role: 'model', content: aiResponse, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, tempAiMsg]);
      
    } catch (e) {
      console.error(e);
      const errorMsg: Message = { id: Date.now().toString(), conversationId: activeConv.id, role: 'model', content: "I encountered a communication error. Please try again.", createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-2xl border-l border-slate-800/50 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-sparkles"></i>
          </div>
          <div>
            <h2 className="text-sm font-black text-white">NovaAssistant</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Agentic Pulse Online</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <i className="fa-solid fa-comment-dots text-4xl text-slate-700"></i>
            <p className="text-sm text-slate-500 font-medium">No transmissions yet.<br/>Try saying "Add a task to buy eggs".</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700/50">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/40 border-t border-slate-800/50">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Direct your agent..."
            className="w-full pl-5 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm text-slate-200"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-20 shadow-lg shadow-indigo-600/20"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
        <p className="mt-3 text-[9px] text-center text-slate-600 font-bold uppercase tracking-[0.2em]">End-to-end Encrypted Session</p>
      </div>
    </div>
  );
};

export default ChatAssistant;
