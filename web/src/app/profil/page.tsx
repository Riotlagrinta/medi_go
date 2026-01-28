'use client';

import React, { useState, useEffect } from 'react';
import { User, MapPin, Activity, Camera, Save, ArrowLeft, Pill, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { supabase } from '@/lib/supabase';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  medical_info: string;
  photo_url: string | null;
}

export default function Profil() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    full_name: 'Utilisateur Test',
    email: 'patient@test.com',
    phone: '',
    address: '',
    medical_info: '',
    photo_url: null
  });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser((prev) => ({
          ...prev,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || prev.full_name
        }));
      }
    };
    checkSession();

    const savedUser = localStorage.getItem('user'); // Utiliser 'user' au lieu de 'patient_user'
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser((prev: UserProfile) => ({
          ...prev,
          ...parsed
        }));
      } catch (e) {
        console.error("Erreur lecture profil", e);
      }
    }
  }, []);

  // ... (handlePhotoUpload reste identique)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Sauvegarder dans le localStorage de manière cohérente
      const sessionUser = {
        ...user,
        role: 'patient'
      };
      localStorage.setItem('user', JSON.stringify(sessionUser));
      
      // On pourrait aussi sauvegarder dans Supabase ici
      
      setLoading(false);
      alert('Profil enregistré ! Redirection vers l\'accueil...');
      router.push('/'); // REDIRECTION VERS L'ACCUEIL
    } catch (error) {
      setLoading(false);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('patient_user');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-100">
              <Pill className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">MediGo</span>
          </div>
          <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-xl transition-all text-sm">
            <LogOut className="w-4 h-4" /> <span className="hidden xs:inline">Quitter</span>
          </button>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all border border-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Mon Profil</h1>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 md:gap-8">
          <div className="w-full">
            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="relative inline-block">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden mb-4 relative mx-auto">
                  {user.photo_url ? (
                    <Image src={user.photo_url} alt="Profil" fill className="object-cover" />
                  ) : (
                    <User className="w-12 h-12 md:w-16 md:h-16 text-slate-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-slate-900 p-2.5 rounded-full text-white shadow-lg hover:bg-slate-800 active:scale-90 transition-all border-2 border-white cursor-pointer z-20">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight">{user.full_name || 'Utilisateur'}</h3>
              <p className="text-sm text-slate-400 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-6">
            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100">
              <h2 className="text-lg md:text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg"><User className="text-emerald-600 w-5 h-5" /></div> 
                Infos Personnelles
              </h2>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                  <input 
                    type="text" 
                    value={user.full_name}
                    onChange={(e) => setUser({...user, full_name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                    <input 
                      type="tel" 
                      value={user.phone}
                      placeholder="+228 90 00 00 00"
                      onChange={(e) => setUser({...user, phone: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold" 
                    />
                  </div>
                  <div className="space-y-1.5 opacity-60">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" 
                      value={user.email}
                      disabled
                      className="w-full bg-slate-200 border-none rounded-2xl py-4 px-6 text-slate-500 cursor-not-allowed font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Adresse de livraison</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      value={user.address}
                      placeholder="Quartier, Rue, Ville"
                      onChange={(e) => setUser({...user, address: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100">
              <h2 className="text-lg md:text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-lg"><Activity className="text-red-500 w-5 h-5" /></div>
                Dossier Médical
              </h2>
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Antécédents & Allergies</label>
                <textarea 
                  rows={4}
                  value={user.medical_info}
                  placeholder="Allergies, Groupe sanguin, Maladies chroniques..."
                  onChange={(e) => setUser({...user, medical_info: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium leading-relaxed"
                ></textarea>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Mettre à jour mon profil</>}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}