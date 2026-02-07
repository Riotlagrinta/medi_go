'use client';

import React, { useState } from 'react';
import { Pill, Heart, Shield, Users, Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle2, Activity, Database, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <main className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg"><Activity className="text-white w-6 h-6" /></div>
            <span className="text-2xl font-bold text-slate-800">MediGo<span className="text-emerald-600">Health</span></span>
          </Link>
          <Link href="/" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour au Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-emerald-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px] opacity-30 -mr-64 -mt-64"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">
            Digitaliser l'accès aux <span className="text-emerald-100">soins au Togo.</span>
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto font-medium">
            MediGo est une plateforme intégrée conçue pour unifier patients, médecins et pharmacies au sein d'un écosystème de santé fluide et sécurisé.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="bg-blue-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">Réseau Pharmaceutique</h3>
            <p className="text-slate-500 leading-relaxed text-lg">
              Une base de données centralisée pour localiser les pharmacies de garde et vérifier la disponibilité des médicaments en temps réel.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-emerald-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-emerald-200">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">Expérience Patient</h3>
            <p className="text-slate-500 leading-relaxed text-lg">
              Une interface intuitive permettant de gérer ses tickets d'attente, ses ordonnances et ses constantes de santé depuis un mobile.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900 w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">Suivi Médical Pro</h3>
            <p className="text-slate-500 leading-relaxed text-lg">
              Des outils dédiés aux médecins pour optimiser les consultations, la télé-expertise et le suivi des patients.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-5xl font-black mb-8 tracking-tighter">Contactez-nous</h2>
              <p className="text-xl text-slate-500 mb-12 leading-relaxed">Vous êtes une pharmacie ou un centre de santé et souhaitez rejoindre le réseau MediGo ? Notre équipe est à votre disposition.</p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="bg-white p-5 rounded-[24px] shadow-sm"><Mail className="text-emerald-600" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold text-lg">contact@medi-go.tg</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="bg-white p-5 rounded-[24px] shadow-sm"><MapPin className="text-emerald-600" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siège</p>
                    <p className="font-bold text-lg">Lomé, Togo</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100">
              {sent ? (
                <div className="text-center py-10 animate-in zoom-in duration-300">
                  <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-2">Message envoyé !</h3>
                  <p className="text-slate-500">Nous vous répondrons sous 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="jean@exemple.tg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      required rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100">
                    Envoyer le message <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 text-center text-slate-400 text-xs">
        <p>© 2026 MediGo. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
