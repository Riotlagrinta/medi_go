'use client';

import React, { useState } from 'react';
import { Pill, Mail, Lock, ArrowRight, Loader2, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Détecter la session au chargement (pour le retour de Google)
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || 'Utilisateur Google',
          role: 'pharmacy_admin', // On force admin pour tes tests
          pharmacy_id: 1
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', session.access_token); // STOCKER LE TOKEN ICI
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Social Login Error:', err);
      setError(`Erreur d'authentification : ${err.message || 'Service indisponible'}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error detail:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEnv = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    alert(`URL chargée: ${url ? 'OUI' : 'NON'}\nClé chargée: ${key ? 'OUI' : 'NON'}`);
    console.log("URL:", url);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] shadow-xl shadow-slate-200/50 p-6 md:p-12 border border-slate-100">
        <div className="flex justify-center mb-4">
          <button onClick={checkEnv} className="text-[10px] text-slate-300 hover:text-slate-500 uppercase font-black tracking-widest bg-slate-50 px-3 py-1 rounded-full">Diagnostic</button>
        </div>
        
        <div className="text-center mb-8 md:mb-10">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 rotate-3">
            <Pill className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Bon retour !</h1>
          <p className="text-sm md:text-base text-slate-500">Connectez-vous à votre espace MediGo</p>
        </div>

        <div className="mb-6 md:mb-8">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 border-2 border-slate-50 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all font-bold text-slate-600 text-sm"
          >
            <Chrome className="w-5 h-5 text-red-500" /> Continuer avec Google
          </button>
        </div>

        <div className="relative mb-6 md:mb-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <span className="relative bg-white px-4 text-[10px] text-slate-400 uppercase font-black tracking-widest">Ou par email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email professionnel</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@pharmacie.tg"
                className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-slate-700"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl text-center border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Se connecter <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-8 md:mt-10 text-center">
          <p className="text-sm text-slate-400 font-medium">
            Nouveau sur MediGo ? <Link href="/inscription" className="text-emerald-600 font-black hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
