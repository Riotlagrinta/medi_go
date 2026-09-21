'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, User, ArrowLeft, Pill, Smile, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Message {
  id: string;
  is_from_pharmacy: boolean;
  content: string;
  created_at: string;
  pharmacy_id: number;
  user_id: number;
  patient_name?: string;
  patient_phone?: string;
}

interface Conversation {
  user_id: number;
  patient_name: string;
  patient_phone?: string;
  lastMessage: Message;
}

export default function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setPharmacyId(user.pharmacy_id);
    }
  }, []);

  const fetchMessages = async () => {
    if (!pharmacyId) return;
    try {
      const response = await api.get(`/messages/${pharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
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
  }, [messages, selectedPatientId]);

  // Regroupe les messages par patient pour afficher une liste de conversations.
  const conversations = useMemo<Conversation[]>(() => {
    const byPatient = new Map<number, Conversation>();
    for (const m of messages) {
      const existing = byPatient.get(m.user_id);
      if (!existing || new Date(m.created_at) > new Date(existing.lastMessage.created_at)) {
        byPatient.set(m.user_id, {
          user_id: m.user_id,
          patient_name: m.patient_name || `Patient #${m.user_id}`,
          patient_phone: m.patient_phone,
          lastMessage: m,
        });
      }
    }
    return Array.from(byPatient.values()).sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages]);

  const thread = useMemo(
    () => messages.filter((m) => m.user_id === selectedPatientId),
    [messages, selectedPatientId]
  );

  const selectedConversation = conversations.find((c) => c.user_id === selectedPatientId) || null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !pharmacyId || !selectedPatientId) return;

    const msg = newMessage;
    setNewMessage('');

    try {
      await api.post('/messages', {
        pharmacy_id: pharmacyId,
        user_id: selectedPatientId,
        is_from_pharmacy: true,
        content: msg,
      });
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-[100] md:relative md:inset-auto md:h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 md:p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (selectedPatientId ? setSelectedPatientId(null) : window.history.back())}
            className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-emerald-100 p-2.5 rounded-2xl">
                <Smile className="text-emerald-600 w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="text-base md:text-xl font-black text-slate-800 tracking-tight leading-none">
                {selectedConversation ? selectedConversation.patient_name : 'Messagerie Patients'}
              </h1>
              {selectedConversation?.patient_phone ? (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" /> {selectedConversation.patient_phone}
                </p>
              ) : (
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                  {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
        {!pharmacyId && (
          <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-600">Retour</Link>
        )}
      </header>

      {!selectedPatientId ? (
        // Liste des conversations (une par patient)
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <MessageCircle className="w-12 h-12 opacity-20" />
              <p className="font-bold text-sm">Aucun message de patient pour le moment.</p>
            </div>
          )}
          {conversations.map((c) => (
            <button
              key={c.user_id}
              onClick={() => setSelectedPatientId(c.user_id)}
              className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-sm flex-shrink-0">
                {c.patient_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-900 text-sm truncate">{c.patient_name}</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase flex-shrink-0">
                    {new Date(c.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {c.lastMessage.is_from_pharmacy ? 'Vous : ' : ''}{c.lastMessage.content}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Fil de discussion avec le patient sélectionné */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {thread.map((m) => (
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

          {/* Champ de réponse */}
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
        </>
      )}
    </div>
  );
}
