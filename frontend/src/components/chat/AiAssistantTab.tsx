import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  Cpu,
  Package,
  CreditCard,
  Scale,
  Award,
  Receipt,
  UserCheck,
  TrendingUp,
  RefreshCw,
  CornerDownLeft,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client';
import { ChatMessage } from '../../types';
import { Badge } from '../ui/Badge';

export const AiAssistantTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const sampleCategories = [
    { label: '📦 Stock Check', query: 'Check my inventory for low stock and days left' },
    { label: '💳 Vendor Dues', query: 'Which supplier payments are pending or have discrepancies?' },
    { label: '⚖️ GST Compliance', query: 'What compliance tasks and GSTR-3B filings are pending?' },
    { label: '🏛️ MSME Schemes', query: 'Are there government subsidies or loan schemes for my store?' },
    { label: '⛽ Log Expense', query: 'Record ₹500 petrol expense for delivery tempo' },
    { label: '👥 Staff Advance', query: 'Raju helper ko 1000 advance diya' },
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
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempMsg._id),
          res.userMessage,
          res.agentMessage,
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-9.5rem)] flex flex-col bg-white rounded-2xl shadow-card border border-slate-200/90 overflow-hidden animate-fade-in">
      {/* Top Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200/80 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                VyaparAI Autonomous Copilot
              </h3>
              <Badge variant="primary" dot>
                7 Agents Active
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Natural language orchestrator connected to real-time store database
            </p>
          </div>
        </div>

        <button
          onClick={loadMessages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Query Chips */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200/70 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Quick Prompts:
        </span>
        {sampleCategories.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.query)}
            disabled={loading}
            className="text-[11px] bg-white hover:bg-primary-50 text-slate-700 hover:text-primary-700 px-3 py-1 rounded-full border border-slate-200/80 hover:border-primary-300 font-medium transition shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">
                How can VyaparAI take action for you today?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask in plain English or Hinglish. I can analyze inventory, draft supplier orders, reconcile payments, review GST deadlines, and log expenses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
              {sampleCategories.slice(0, 4).map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(c.query)}
                  className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-card hover:border-primary-300 text-left transition group"
                >
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-primary-600">
                    {c.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.query}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.sender === 'USER';
          return (
            <div key={m._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-xs'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-card'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-1.5 text-primary-700 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                      <span>{m.agentName || 'VyaparAI Orchestrator'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed">
                  {m.content}
                </div>

                {/* Interactive Action Buttons */}
                {m.metadata?.actionButtons && m.metadata.actionButtons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                    {m.metadata.actionButtons.map((btn: any, bidx: number) => (
                      <button
                        key={bidx}
                        onClick={() => handleSend(btn.actionPayload)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition shadow-xs flex items-center space-x-1.5"
                      >
                        <span>{btn.label}</span>
                        <CornerDownLeft className="w-3 h-3 opacity-80" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center space-x-3 shadow-card">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800 text-[11px]">
                  Autonomous Agent Workflow Running...
                </p>
                <p className="text-[10px] text-slate-400">
                  Orchestrator delegating tools to domain micro-agents
                </p>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Dock */}
      <div className="p-3.5 bg-white border-t border-slate-200/90">
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
            placeholder="Type instructions: 'Order 20kg rice', 'Reconcile ABC vendor invoice'..."
            className="flex-1 text-xs bg-slate-50/80 border border-slate-200/90 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={loading || input.trim() === ''}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs disabled:opacity-40 disabled:hover:bg-primary-600 shrink-0 active:scale-95"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
