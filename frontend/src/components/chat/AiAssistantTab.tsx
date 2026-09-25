import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, ChevronDown, ChevronUp, Cpu, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ChatMessage } from '../../types';

export const AiAssistantTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const sampleQueries = [
    'How is my business doing?',
    'Check my inventory for low stock',
    'Which supplier payments are pending?',
    'What compliance tasks are pending?',
    'Are there government schemes for my store?',
    'Record ₹2,000 petrol expense',
  ];

  const loadMessages = async () => {
    try {
      const res = await api.getChatMessages('WEB_ASSISTANT');
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text || text.trim() === '' || loading) return;

    setInput('');
    setLoading(true);

    const tempMsg: ChatMessage = {
      _id: `temp_${Date.now()}`,
      sender: 'USER',
      messageType: 'TEXT',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await api.sendChatMessage(text, 'WEB_ASSISTANT');
      if (res && res.agentMessage) {
        setMessages((prev) => [...prev.filter((m) => m._id !== tempMsg._id), res.userMessage, res.agentMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">VyaparAI Orchestrator Assistant</h3>
            <p className="text-[11px] text-slate-400">Multi-agent back office coordination engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>6 Domain Agents Active</span>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Sample Prompts:</span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div className="max-w-md space-y-2">
              <Bot className="w-12 h-12 text-emerald-600 mx-auto opacity-70" />
              <h4 className="font-bold text-slate-900 text-sm">How can I assist your business today?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                I can check real-time stock levels, draft purchase orders with your suppliers, reconcile payments, review GST deadlines, and match government subsidies.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.sender === 'USER';
          return (
            <div key={m._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                {!isUser && (
                  <div className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{m.agentName || 'VyaparAI Orchestrator'}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.metadata?.actionButtons && (
                  <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                    {m.metadata.actionButtons.map((btn, bidx) => (
                      <button
                        key={bidx}
                        onClick={() => handleSend(btn.actionPayload)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Orchestrator delegating to specialized agents...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inventory, supplier dues, GST, or government schemes..."
            className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={loading || input.trim() === ''}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm disabled:opacity-40"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
