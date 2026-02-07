'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Activity, FileText, Bell, Search, 
  MapPin, PlusCircle, ChevronRight, CheckCircle, Home, LogOut, X, Heart
} from 'lucide-react';
import Link from 'next/link';

export default function PatientProPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newRdvOpen, setByOpen] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  // Load / Save Logic (Persistence for Demo)
  useEffect(() => {
    const saved = localStorage.getItem('medigo_rdv');
    if (saved) setAppointments(JSON.parse(saved));
    else {
      const initial = [
        { id: 1, doctor: 'Dr. Sarah Conner', role: 'Cardiologue', date: '12 Oct', time: '10:00', status: 'confirmed' },
        { id: 2, doctor: 'Dr. Gregory House', role: 'Généraliste', date: '25 Oct', time: '14:30', status: 'pending' },
      ];
      setAppointments(initial);
      localStorage.setItem('medigo_rdv', JSON.stringify(initial));
    }
  }, []);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleAddRdv = (spec: string) => {
    const newRdv = {
      id: Date.now(),
      doctor: spec === 'Cardiologie' ? 'Dr. Sarah Conner' : 'Dr. Gregory House',
      role: spec,
      date: 'Demain',
      time: '09:00',
      status: 'pending'
    };
    const updated = [newRdv, ...appointments];
    setAppointments(updated);
    localStorage.setItem('medigo_rdv', JSON.stringify(updated));
    setByOpen(false);
    showNotif(`Demande de RDV en ${spec} envoyée !`);
  };

  const cancelRdv = (id: number) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem('medigo_rdv', JSON.stringify(updated));
    showNotif("Rendez-vous annulé.");
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'rdv':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">Mon Agenda</h2>
                <button onClick={() => setByOpen(true)} className="p-2 bg-emerald-600 text-white rounded-xl"><PlusCircle className="w-6 h-6"/></button>
             </div>
             <div className="space-y-4">
                {appointments.map(rdv => (
                  <div key={rdv.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 font-bold border border-slate-100">
                      <span className="text-[8px] uppercase">{rdv.date.split(' ')[1]}</span>
                      <span className="text-lg">{rdv.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{rdv.doctor}</p>
                      <p className="text-xs text-slate-500">{rdv.role} • {rdv.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${rdv.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {rdv.status === 'confirmed' ? 'Confirmé' : 'Attente'}
                       </span>
                       <button onClick={() => cancelRdv(rdv.id)} className="text-[10px] text-red-500 font-bold hover:underline">Annuler</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'docs':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black">Dossier Médical</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <Activity className="text-blue-600 mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Groupe Sanguin</p>
                  <p className="text-2xl font-black">O+</p>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <Heart className="text-red-500 mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Allergies</p>
                  <p className="text-lg font-black text-red-600">Pénicilline</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <h3 className="font-bold mb-4">Dernières Ordonnances</h3>
               <div className="space-y-3">
                  {['Doliprane 1000mg', 'Spasfon Lyoc'].map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium">{m}</span>
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-emerald-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-100">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Patient Premium</span>
                        <h2 className="text-3xl font-black mt-4">Jean Dupont</h2>
                        <p className="text-emerald-100 mt-1">Lomé, Quartier Adidoadin</p>
                    </div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://medi-go-murex.vercel.app/" className="w-20 h-20 bg-white p-2 rounded-2xl shadow-lg" alt="QR"/>
                </div>
            </section>
            
            <section className="grid grid-cols-2 gap-4">
               <button onClick={() => setByOpen(true)} className="bg-blue-600 text-white p-6 rounded-[28px] shadow-lg shadow-blue-200 flex flex-col items-center gap-2">
                  <PlusCircle className="w-8 h-8"/>
                  <span className="text-xs font-black uppercase">Prendre RDV</span>
               </button>
               <button onClick={() => setActiveTab('docs')} className="bg-white text-emerald-600 p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8"/>
                  <span className="text-xs font-black uppercase">Mon Dossier</span>
               </button>
            </section>

            <section>
                <h3 className="text-lg font-black mb-4">Prochain RDV</h3>
                {appointments.filter(a => a.status === 'confirmed')[0] ? (
                  <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black">
                        <span className="text-[10px] uppercase">{appointments.filter(a => a.status === 'confirmed')[0].date.split(' ')[1]}</span>
                        <span className="text-xl">{appointments.filter(a => a.status === 'confirmed')[0].date.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{appointments.filter(a => a.status === 'confirmed')[0].doctor}</p>
                        <p className="text-xs text-slate-500">{appointments.filter(a => a.status === 'confirmed')[0].role} • {appointments.filter(a => a.status === 'confirmed')[0].time}</p>
                      </div>
                      <MapPin className="text-slate-300" />
                  </div>
                ) : (
                  <p className="text-center py-10 bg-slate-100 rounded-[28px] text-slate-400 font-medium">Aucun rendez-vous confirmé</p>
                )}
            </section>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28 md:pb-0">
      
      {/* Notifications */}
      {notif && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="text-emerald-400 w-5 h-5" />
          <span className="font-bold text-sm">{notif}</span>
        </div>
      )}

      {/* Header Desktop */}
      <header className="hidden md:flex bg-white h-20 items-center justify-between px-10 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-600 w-8 h-8" />
          <span className="text-2xl font-black">MediGo</span>
        </div>
        <div className="flex items-center gap-8 font-bold text-slate-500">
           <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-emerald-600' : ''}>Accueil</button>
           <button onClick={() => setActiveTab('rdv')} className={activeTab === 'rdv' ? 'text-emerald-600' : ''}>Agenda</button>
           <button onClick={() => setActiveTab('docs')} className={activeTab === 'docs' ? 'text-emerald-600' : ''}>Dossier</button>
           <Link href="/" className="text-red-500">Quitter</Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 md:p-10">
        {renderTab()}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-emerald-600 scale-110' : 'text-slate-300'}><Home/></button>
        <button onClick={() => setActiveTab('rdv')} className={activeTab === 'rdv' ? 'text-emerald-600 scale-110' : 'text-slate-300'}><Calendar/></button>
        <button onClick={() => setByOpen(true)} className="bg-emerald-600 text-white p-4 rounded-2xl -mt-12 shadow-xl shadow-emerald-200"><PlusCircle/></button>
        <button onClick={() => setActiveTab('docs')} className={activeTab === 'docs' ? 'text-emerald-600 scale-110' : 'text-slate-300'}><FileText/></button>
        <Link href="/" className="text-slate-300"><LogOut/></Link>
      </nav>

      {/* Modal RDV */}
      {newRdvOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end">
           <div className="bg-white w-full rounded-t-[40px] p-10 animate-in slide-in-from-bottom-full duration-500">
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
              <h3 className="text-2xl font-black mb-6">Prendre rendez-vous</h3>
              <div className="grid grid-cols-2 gap-4 mb-10">
                {['Généraliste', 'Cardiologie', 'Dentiste', 'Pédiatre'].map(s => (
                  <button key={s} onClick={() => handleAddRdv(s)} className="p-6 bg-slate-50 rounded-3xl font-bold text-left hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 transition-all">{s}</button>
                ))}
              </div>
              <button onClick={() => setByOpen(false)} className="w-full py-5 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-xs">Annuler</button>
           </div>
        </div>
      )}
    </div>
  );
}