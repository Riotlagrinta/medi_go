'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ArrowLeft, Pill, Smile } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

import { api } from '@/lib/api';

interface Message {
  id: string;
  is_from_pharmacy: boolean;
  content: string;
  created_at: string;
  pharmacy_id: number;
}

export default function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setPharmacyId(user.pharmacy_id);
      }
    };
    initUser();
  }, []);

  const fetchMessages = async () => {
    if (!pharmacyId) return;
    try {
      const response = await api.get(`/messages/${pharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (!pharmacyId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [pharmacyId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !pharmacyId) return;

    const msg = newMessage;
    setNewMessage('');

    try {
      await api.post('/messages', {
        pharmacy_id: pharmacyId,
        is_from_pharmacy: true,
        content: msg
      });
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-[100] md:relative md:inset-auto md:h-screen overflow-hidden">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-100 p-4 md:p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-emerald-100 p-2.5 rounded-2xl">
                <Smile className="text-emerald-600 w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="text-base md:text-xl font-black text-slate-800 tracking-tight leading-none">Conseil Patient</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">En ligne</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.is_from_pharmacy ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${m.is_from_pharmacy ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                m.is_from_pharmacy ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'
              }`}>
                {m.is_from_pharmacy ? <Pill className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={`p-4 rounded-[24px] text-sm font-bold shadow-sm border ${
                  m.is_from_pharmacy 
                    ? 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none' 
                    : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{m.content}</p>
                </div>
                <p className={`text-[9px] font-black uppercase tracking-tighter text-slate-400 px-1 ${m.is_from_pharmacy ? 'text-right' : ''}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-slate-100 p-4 md:p-6 pb-safe">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Répondre au patient..."
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 pr-12 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-bold transition-all shadow-inner"
            />
          </div>
          <button type="submit" disabled={!newMessage.trim()} className="bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all shadow-lg">
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}