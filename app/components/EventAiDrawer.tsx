// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Clock, MapPin, CheckCircle, FileText, RotateCcw, Bot, User, Sparkles } from 'lucide-react';

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

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          text: `Hi! I'm your Gemini AI Assistant for **${cleanTitle}**. Ask me anything about the schedule, venue details, prerequisites, or registration guidance!`,
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
        text: `Conversation reset. Ready to assist you with **${cleanTitle}**!`,
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999999]"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 w-full sm:w-[480px] h-[92dvh] sm:h-full bg-[#090a0f] border-t sm:border-t-0 sm:border-l border-white/10 z-[999999] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] sm:shadow-2xl text-white font-sans rounded-t-3xl sm:rounded-none overflow-hidden"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#11131c] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 relative shadow-inner">
                  <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090a0f] animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight truncate">
                      Gemini Assistant
                    </h3>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shrink-0">
                      Gemini 1.5 Flash
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

            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
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
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[86%] sm:max-w-[82%] rounded-2xl p-4 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-white text-[#0a0a0a] font-medium rounded-tr-sm'
                        : 'bg-[#141724] text-slate-200 border border-white/10 rounded-tl-sm'
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
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
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
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141724] hover:bg-[#1d2235] border border-white/10 hover:border-indigo-500/50 text-left text-xs text-slate-300 hover:text-white transition-all shadow-sm group"
                        >
                          <Icon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="truncate">{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-3 text-slate-300 text-xs bg-[#141724] p-3.5 rounded-xl border border-white/10 w-fit shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-medium">Gemini is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0d0e15] shrink-0 pb-[max(0.85rem,env(safe-area-inset-bottom))]"
            >
              <div className="relative flex items-center bg-[#141724] rounded-2xl border border-white/15 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-1.5 pl-4 shadow-xl">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Gemini about schedule, venue, prerequisites..."
                  className="w-full bg-transparent text-white placeholder-slate-400 py-2 text-xs sm:text-sm focus:outline-none pr-3"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-30 transition-all flex items-center justify-center shrink-0 shadow-md active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
