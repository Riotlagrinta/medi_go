'use client';

import React, { useState } from 'react';
import { Pill, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function Inscription() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: 'patient'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 md:py-12">
      <div className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] shadow-xl shadow-slate-200/50 p-6 md:p-12 border border-slate-100">
        <div className="text-center mb-8 md:mb-10">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 -rotate-3">
            <Pill className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Créer un compte</h1>
          <p className="text-sm md:text-base text-slate-500">Rejoignez MediGo dès aujourd&apos;hui</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Ex: Jean Dupont"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 md:py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="jean@exemple.tg"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 md:py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl text-center border border-red-100 animate-shake">{error}</div>}

          {success ? (
            <div className="bg-emerald-50 text-emerald-700 p-6 md:p-8 rounded-[24px] text-center border-2 border-emerald-100 animate-in zoom-in duration-300">
              <div className="bg-emerald-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                <Mail className="text-white w-7 h-7" />
              </div>
              <h3 className="font-black text-xl mb-2 tracking-tight">Vérifiez vos emails</h3>
              <p className="text-sm leading-relaxed mb-6">Un lien de confirmation a été envoyé à <br/><strong className="text-emerald-800">{formData.email}</strong>.</p>
              <Link href="/connexion" className="inline-block w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all">Retour à la connexion</Link>
            </div>
          ) : (
            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 mt-4"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Créer mon compte <ArrowRight className="w-5 h-5" /></>}
            </button>
          )}
        </form>

        <div className="mt-8 md:mt-10 text-center">
          <p className="text-sm text-slate-400 font-medium">
            Déjà inscrit ? <Link href="/connexion" className="text-emerald-600 font-black hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  );
}