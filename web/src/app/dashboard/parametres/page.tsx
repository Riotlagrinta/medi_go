'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Lock, ArrowLeft, Pill, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Parametres() {
  const [pharmacyName, setPharmacyName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setPharmacyName(user.pharmacy_name);
    setEmail(user.email);
    setNewEmail(user.email);
  }, []);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (newEmail !== email) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
        alert("Email de confirmation envoyé.");
      }
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        alert("Mot de passe mis à jour.");
      }
      setNewPassword('');
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Réglages</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Section Établissement */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100">
          <h2 className="text-base md:text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-emerald-50 p-2 rounded-lg"><Pill className="text-emerald-600 w-5 h-5" /></div> 
            Ma Pharmacie
          </h2>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom public</label>
              <input type="text" defaultValue={pharmacyName} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone Direct</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="+228 90 00 00 00" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Géo</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="Lomé, Togo" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100">
          <h2 className="text-base md:text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg"><ShieldCheck className="text-blue-600 w-5 h-5" /></div> 
            Sécurité & Compte
          </h2>
          <form onSubmit={handleUpdateAccount} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de gestion</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Changer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="password" 
                  value={newPassword}
                  placeholder="••••••••"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner" 
                />
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-slate-800 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? "Chargement..." : "Sauvegarder les modifications"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}