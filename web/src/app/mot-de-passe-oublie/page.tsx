'use client';

import React, { useState } from 'react';
import { Pill, Mail, ArrowRight, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Une erreur est survenue');
      }
      setSent(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] shadow-xl shadow-slate-200/50 p-6 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 rotate-3">
            <Pill className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Mot de passe oublié</h1>
          <p className="text-sm md:text-base text-slate-500">
            {sent
              ? "Vérifiez votre boîte mail pour continuer."
              : "Indiquez votre email, nous vous envoyons un lien de réinitialisation."}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex flex-col items-center gap-3">
              <MailCheck className="w-10 h-10" />
              <p className="text-sm font-bold">
                Si un compte existe pour <span className="text-emerald-800">{email}</span>, un email vient de vous être envoyé.
              </p>
            </div>
            <Link href="/connexion" className="text-sm text-slate-500 font-medium hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.tg"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-slate-700 font-medium"
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
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Envoyer le lien <ArrowRight className="w-5 h-5" /></>}
            </button>

            <div className="text-center pt-2">
              <Link href="/connexion" className="text-sm text-slate-400 font-medium hover:underline inline-flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
