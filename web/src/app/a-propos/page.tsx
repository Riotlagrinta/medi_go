'use client';

import React, { useState } from 'react';
import { Pill, Heart, Shield, Users, Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi
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
            <div className="bg-emerald-600 p-2 rounded-lg"><Pill className="text-white w-6 h-6" /></div>
            <span className="text-2xl font-bold text-slate-800">MediGo</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-emerald-600 flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-emerald-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-50 -mr-48 -mt-48"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Notre Mission : <br/><span className="text-emerald-200">Rapprocher la santé de vous.</span></h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
            MediGo est née d'une vision simple : personne ne devrait avoir à parcourir toute la ville pour trouver un médicament vital.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center text-blue-600">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black">Sécurité Totale</h3>
            <p className="text-slate-500 leading-relaxed">Nous garantissons la protection de vos données de santé et la fiabilité des informations fournies par nos pharmacies partenaires.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center text-emerald-600">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black">Pour Tous</h3>
            <p className="text-slate-500 leading-relaxed">Une interface pensée pour être simple, que vous soyez un patient pressé ou un pharmacien gérant ses stocks.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-amber-50 w-16 h-16 rounded-3xl flex items-center justify-center text-amber-600">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black">Engagement Local</h3>
            <p className="text-slate-500 leading-relaxed">Nous soutenons les pharmacies locales au Togo en digitalisant leurs services pour mieux servir la communauté.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-8 tracking-tight">Contactez-nous</h2>
              <p className="text-lg text-slate-500 mb-10">Vous avez une question, une suggestion ou vous souhaitez devenir pharmacie partenaire ? Notre équipe est à votre écoute.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm"><Mail className="text-emerald-600" /></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="font-bold">contact@medi-go.tg</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm"><Phone className="text-emerald-600" /></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Téléphone</p>
                    <p className="font-bold">+228 90 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm"><MapPin className="text-emerald-600" /></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Siège</p>
                    <p className="font-bold">Lomé, Quartier Adidoadin</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100">
              {sent ? (
                <div className="text-center py-10 animate-in zoom-in duration-300">
                  <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Message envoyé !</h3>
                  <p className="text-slate-500">Merci de nous avoir contactés. <br/>Nous vous répondrons sous 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="jean@exemple.tg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      required rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                    Envoyer le message <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 text-center text-slate-400 text-sm">
        <p>© 2026 MediGo. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
