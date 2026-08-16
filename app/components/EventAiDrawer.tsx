// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Clock, MapPin, CheckCircle, FileText, RotateCcw, Bot, User } from 'lucide-react';

interface EventAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  systemPrompt: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  provider?: string;
  timestamp: string;
}

function renderFormattedMessage(text: string) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="text-xs sm:text-sm font-bold text-white font-display mt-2 mb-1">
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.slice(2);
          return (
            <div key={lineIdx} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
              <span className="text-[#6366f1] font-bold mt-0.5">•</span>
              <div>{renderInlineFormatting(content)}</div>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
              <span className="text-[#6366f1] font-mono font-bold text-[11px] mt-0.5">{numMatch[1]}.</span>
              <div>{renderInlineFormatting(numMatch[2])}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-xs sm:text-sm leading-relaxed">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-white font-mono px-1 py-0.5 bg-[#1e2335] rounded border border-white/10 inline-block my-0.5">
          {boldText}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="font-mono text-[11px] text-indigo-300 bg-[#141722] px-1.5 py-0.5 rounded border border-indigo-500/20">
          {codeText}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export default function EventAiDrawer({
  isOpen,
  onClose,
  eventTitle,
  systemPrompt,
}: EventAiDrawerProps) {
  const cleanTitle = eventTitle ? eventTitle.replace(/\*\*/g, '').trim() : 'this event';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: '1',
          sender: 'ai',
          text: `Welcome to the official event desk for **${cleanTitle}**. I'm your AI assistant for this session. Feel free to ask about the schedule, venue, prerequisites, or registration guidance!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, cleanTitle]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const sendQueryText = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          systemPrompt,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I ran into a quick glitch looking up that detail. Mind asking me one more time?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendQueryText(inputMessage);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: `Conversation reset. I'm ready to answer any questions about **${cleanTitle}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPills = [
    { label: "What's the schedule & timings?", icon: Clock },
    { label: 'Where is the venue located?', icon: MapPin },
    { label: 'Are there any prerequisites?', icon: CheckCircle },
    { label: 'How do I register?', icon: FileText },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] h-[100dvh] max-h-[100dvh] bg-[#0c0d12] border-l border-white/10 z-[200] flex flex-col shadow-2xl text-white font-sans overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#12141d]/90 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#818cf8] flex items-center justify-center shrink-0 relative">
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0d12] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight truncate">
                      Event Assistant
                    </h3>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-[210px] sm:max-w-[260px]">
                    {cleanTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleResetChat}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  title="Reset conversation"
                  aria-label="Reset Conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  aria-label="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#818cf8] shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[82%] rounded-2xl p-4 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-white text-[#0a0a0a] font-medium rounded-tr-sm'
                        : 'bg-[#161a29] text-slate-200 border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    <div>{renderFormattedMessage(msg.text)}</div>
                    <div
                      className={`mt-2 text-[10px] font-mono text-right ${
                        msg.sender === 'user' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {messages.length === 1 && !loading && (
                <div className="pt-3 space-y-2.5">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
                    Suggested Questions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {quickPills.map((pill) => {
                      const Icon = pill.icon;
                      return (
                        <button
                          key={pill.label}
                          onClick={() => sendQueryText(pill.label)}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141722] hover:bg-[#1c2132] border border-white/10 hover:border-[#6366f1]/50 text-left text-xs text-slate-300 hover:text-white transition-all shadow-sm group"
                        >
                          <Icon className="w-4 h-4 text-[#6366f1] group-hover:scale-110 transition-transform shrink-0" />
                          <span className="truncate">{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-3 text-slate-300 text-xs bg-[#161a29] p-3.5 rounded-xl border border-white/10 w-fit shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1] animate-ping" />
                  <span className="font-medium">Checking event records...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-white/10 bg-[#0e1018] shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about schedule, venue, prerequisites..."
                  className="w-full bg-[#161a29] text-white placeholder-slate-400 rounded-xl px-4 py-3.5 text-xs sm:text-sm border border-white/10 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all pr-12"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="absolute right-2 w-9 h-9 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center shadow-md"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
