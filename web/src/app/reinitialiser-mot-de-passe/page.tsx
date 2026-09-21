'use client';

import React, { Suspense, useState } from 'react';
import { Pill, Lock, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Lien invalide : le jeton de réinitialisation est manquant.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible de réinitialiser le mot de passe');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setDone(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-3">
          <XCircle className="w-10 h-10" />
          <p className="text-sm font-bold">Ce lien de réinitialisation est invalide ou incomplet.</p>
        </div>
        <Link href="/mot-de-passe-oublie" className="text-sm text-emerald-600 font-black hover:underline">
          Refaire une demande
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex flex-col items-center gap-3">
          <CheckCircle2 className="w-10 h-10" />
          <p className="text-sm font-bold">Mot de passe mis à jour ! Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="password" required minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-slate-700"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer</label>
        <div className="relative">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="password" required minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-slate-700"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl text-center border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 mt-4"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Réinitialiser <ArrowRight className="w-5 h-5" /></>}
      </button>
    </form>
  );
}

export default function ReinitialiserMotDePasse() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] shadow-xl shadow-slate-200/50 p-6 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 rotate-3">
            <Pill className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Nouveau mot de passe</h1>
          <p className="text-sm md:text-base text-slate-500">Choisissez un mot de passe sécurisé pour votre compte.</p>
        </div>

        <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
