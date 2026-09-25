import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Bot,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Mic,
  Volume2,
  Square,
} from 'lucide-react';
import { api } from '../../api/client';
import { ChatMessage } from '../../types';

interface WhatsAppSimulatorTabProps {
  onApprovalUpdate?: () => void;
  initialPrompt?: string | null;
  onPromptHandled?: () => void;
}

export const WhatsAppSimulatorTab: React.FC<WhatsAppSimulatorTabProps> = ({
  onApprovalUpdate,
  initialPrompt,
  onPromptHandled,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'How is my business doing?',
    'Check my inventory',
    'Handle the low stock',
    'Check supplier payments',
    'What compliance tasks are pending?',
    'Find schemes for my business',
    'Petrol 2000',
    'Rice kitna bacha hai?',
    'Order the rice',
  ];

  const fetchChat = async () => {
    try {
      const res = await api.getChatMessages('WHATSAPP');
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  useEffect(() => {
    fetchChat();
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onPromptHandled) onPromptHandled();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text || text.trim() === '' || sending) return;

    setInputText('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      _id: `temp_${Date.now()}`,
      sender: 'USER',
      messageType: 'TEXT',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setTyping(true);

    try {
      const res = await api.sendChatMessage(text, 'WHATSAPP');
      setTyping(false);
      if (res && res.agentMessage) {
        setMessages((prev) => [...prev.filter((m) => m._id !== tempUserMsg._id), res.userMessage, res.agentMessage]);
      } else {
        await fetchChat();
      }
      if (onApprovalUpdate) onApprovalUpdate();
    } catch (err) {
      setTyping(false);
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleButtonClick = async (payload: string) => {
    await handleSend(payload);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-xl font-bold border-2 border-emerald-400/40">
              🤖
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-400 absolute bottom-0 right-0 border-2 border-[#075E54]"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm tracking-tight text-white">VyaparAI Back Office</h3>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded font-semibold uppercase">
                Official MSME Agent
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 flex items-center space-x-1">
              <span>Online • Autonomous Orchestrator</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-emerald-100">
          <button className="hover:text-white transition" title="Simulated Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="hover:text-white transition" title="Simulated Video">
            <Video className="w-4 h-4" />
          </button>
          <button className="hover:text-white transition" title="Options">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="bg-[#128C7E]/10 border-b border-emerald-800/30 px-4 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-semibold text-emerald-400 shrink-0 flex items-center space-x-1 mr-1">
          <Sparkles className="w-3 h-3" />
          <span>Demo Prompts:</span>
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={sending}
            className="text-[11px] bg-slate-800/90 hover:bg-emerald-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 hover:border-emerald-500 whitespace-nowrap transition shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body (WhatsApp Wallpaper look) */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0b141a]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(18, 140, 126, 0.05) 0%, transparent 60%)`,
        }}
      >
        <div className="text-center my-2">
          <span className="bg-slate-800 text-slate-400 text-[10px] font-medium px-3 py-1 rounded-full uppercase tracking-wider border border-slate-700">
            Messages are end-to-end simulated with autonomous AI back office
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div key={msg._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md relative ${
                  isUser
                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                    : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/60'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center space-x-1.5 mb-1.5 text-[11px] font-bold text-emerald-400">
                    <Bot className="w-3.5 h-3.5" />
                    <span>{msg.agentName || 'VyaparAI'}</span>
                  </div>
                )}

                <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Interactive Action Buttons / Approval Cards */}
                {msg.metadata?.actionButtons && msg.metadata.actionButtons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-600/50 flex flex-wrap gap-2">
                    {msg.metadata.actionButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleButtonClick(btn.actionPayload)}
                        disabled={sending}
                        className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition shadow-sm ${
                          btn.style === 'danger'
                            ? 'bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40'
                            : btn.style === 'secondary'
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-1 mt-1.5 text-[10px] text-slate-400">
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] text-slate-300 rounded-2xl rounded-tl-none p-3 shadow-md border border-slate-700/60 flex items-center space-x-2">
              <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300 font-medium">VyaparAI is planning action...</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Input Footer */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center space-x-2.5 shrink-0 border-t border-slate-800">
        <button className="text-slate-400 hover:text-slate-200 transition" title="Emoji">
          <Smile className="w-5 h-5" />
        </button>
        <button className="text-slate-400 hover:text-slate-200 transition" title="Attach Document / Bill">
          <Paperclip className="w-5 h-5" />
        </button>

        {isRecordingVoice ? (
          <div className="flex-1 flex items-center justify-between bg-red-950/40 border border-red-800/60 rounded-xl px-4 py-2 text-xs">
            <div className="flex items-center space-x-2 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-semibold">Simulating Voice Note...</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsRecordingVoice(false);
                  handleSend('Rice kitna bacha hai?');
                }}
                className="text-[11px] bg-red-900/60 hover:bg-red-800 text-red-200 px-2.5 py-1 rounded-md"
              >
                &quot;Rice kitna bacha hai?&quot;
              </button>
              <button
                onClick={() => {
                  setIsRecordingVoice(false);
                  handleSend('Handle the low stock');
                }}
                className="text-[11px] bg-red-900/60 hover:bg-red-800 text-red-200 px-2.5 py-1 rounded-md"
              >
                &quot;Handle the low stock&quot;
              </button>
              <button
                onClick={() => setIsRecordingVoice(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex-1 flex items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type in English or Hinglish (e.g. 'Order the rice', 'Kitna payment baki hai')..."
              className="w-full bg-[#2a3942] text-white text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder-slate-400"
            />
          </form>
        )}

        {inputText.trim() !== '' ? (
          <button
            onClick={() => handleSend()}
            disabled={sending}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={() => setIsRecordingVoice(!isRecordingVoice)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-md shrink-0 ${
              isRecordingVoice
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-[#00a884] hover:bg-[#008f6f] text-white'
            }`}
            title="Simulate Voice Note recording"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
