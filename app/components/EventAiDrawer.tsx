// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles, Clock, MapPin, CheckCircle, FileText } from 'lucide-react';

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

  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-white font-mono px-1 py-0.5 bg-[#161a29] rounded border border-[#1e2436] inline-block my-0.5">
          {boldText}
        </strong>
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
          text: `Welcome to the official event desk for "${cleanTitle}". I'm your AI assistant for this session. Feel free to ask about the schedule, venue, prerequisites, or registration guidance!`,
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[200]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#0a0a0a] border-l border-neutral-800 z-[200] flex flex-col shadow-2xl text-white font-sans"
          >
            <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-[#111113]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5 font-display">
                    Event Assistant
                  </h3>
                  <p className="text-xs text-neutral-400 truncate max-w-[220px]">
                    {cleanTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-white text-[#0a0a0a] font-medium rounded-br-none shadow-sm'
                        : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {renderFormattedMessage(msg.text)}
                    </div>
                    <div className="mt-2 text-[10px] opacity-70 text-right font-mono">
                      {msg.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}

              {messages.length === 1 && !loading && (
                <div className="pt-2 space-y-2">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Suggested Questions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickPills.map((pill) => {
                      const Icon = pill.icon;
                      return (
                        <button
                          key={pill.label}
                          onClick={() => sendQueryText(pill.label)}
                          className="flex items-center space-x-2 p-2.5 rounded-lg bg-[#0f121d] border border-[#1e2436] hover:border-[#6366f1] text-left text-xs text-[#94a3b8] hover:text-white transition-colors group"
                        >
                          <Icon className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
                          <span className="truncate">{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center space-x-2 text-[#94a3b8] text-xs bg-[#0f121d] p-3 rounded-xl border border-[#1e2436] w-fit">
                  <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-ping" />
                  <span>Checking event records...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1e2436] bg-[#0f121d]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about schedule, venue, prerequisites..."
                  className="w-full bg-[#161a29] text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xs border border-[#1e2436] focus:outline-none focus:border-[#6366f1] transition-colors pr-12"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="absolute right-2 p-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg disabled:opacity-40 transition-colors"
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
