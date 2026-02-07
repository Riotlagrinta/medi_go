'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Activity, Settings, Bell, Search, 
  MapPin, PlusCircle, ChevronRight, CheckCircle, Home, LogOut, Phone, Video, FileText, Clock, Menu, X, Save, Printer
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorProPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notif, setNotif] = useState<string | null>(null);

  const [patients, setPatients] = useState([
    { id: 1, name: 'Jean Dupont', age: 45, status: 'waiting', reason: 'Consultation Générale', time: '09:00' },
    { id: 2, name: 'Marie Curie', age: 32, status: 'in_progress', reason: 'Suivi Cardiologique', time: '09:30' },
    { id: 3, name: 'Albert Einstein', age: 76, status: 'waiting', reason: 'Renouvellement Ordonnance', time: '08:30' },
    { id: 4, name: 'Thomas Edison', age: 12, status: 'waiting', reason: 'Fièvre', time: '10:00' },
  ]);

  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('medigo_rdv');
    if (saved) setAppointments(JSON.parse(saved));
  }, []);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleRdvAction = (id: number, action: 'confirm' | 'reject') => {
    let updated;
    if (action === 'confirm') {
      updated = appointments.map(a => a.id === id ? { ...a, status: 'confirmed' } : a);
      showNotif("Rendez-vous confirmé.");
    } else {
      updated = appointments.filter(a => a.id !== id);
      showNotif("Demande refusée.");
    }
    setAppointments(updated);
    localStorage.setItem('medigo_rdv', JSON.stringify(updated));
  };

  const finishConsultation = (id: number) => {
    const updated = patients.map(p => p.id === id ? { ...p, status: 'finished' } : p);
    setPatients(updated);
    showNotif("Consultation terminée.");
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentPatient = patients.find(p => p.status === 'in_progress') || patients[1];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex overflow-hidden">
      
      {/* Notifications */}
      {notif && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
          <CheckCircle className="text-emerald-400 w-5 h-5" />
          <span className="font-bold text-sm">{notif}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-30`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
           <div className={`flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Activity className="w-5 h-5" /></div>
              <span className="font-black text-xl tracking-tight">MediGo<span className="text-emerald-600">Pro</span></span>
           </div>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            {[
                { id: 'dashboard', icon: Home, label: 'Tableau de bord' },
                { id: 'patients', icon: Users, label: 'Mes Patients' },
                { id: 'planning', icon: Calendar, label: 'Planning' },
                { id: 'settings', icon: Settings, label: 'Paramètres' },
            ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`${!sidebarOpen && 'hidden'}`}>{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
            <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-colors font-bold text-sm px-4 py-3">
                <LogOut className="w-5 h-5" />
                <span className={`${!sidebarOpen && 'hidden'}`}>Déconnexion</span>
            </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto p-8 lg:p-12 space-y-10">
        
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">Dr. Sarah Conner</h1>
                <p className="text-slate-500 font-medium">Vous avez <span className="text-emerald-600 font-bold">{appointments.filter(a => a.status === 'pending').length}</span> demandes de rendez-vous.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Chercher..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-sm w-64 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all" 
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <button className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-emerald-600 shadow-sm relative transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black border-4 border-white shadow-xl">SC</div>
            </div>
        </header>

        {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* LEFT: Consultation Area */}
                <div className="md:col-span-8 space-y-8">
                    <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border border-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 px-6 py-3 bg-red-50 text-red-600 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 animate-pulse">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span> Consultation Live
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
                            <div className="w-28 h-28 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 text-4xl font-black border-4 border-white shadow-inner">
                                {currentPatient.name[0]}
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{currentPatient.name}</h2>
                                <p className="text-slate-500 text-lg mb-6">{currentPatient.reason}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                    <span className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-400">ID: PAT-00{currentPatient.id}</span>
                                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight">{currentPatient.age} ans</span>
                                    <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight">Urgent</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button onClick={() => showNotif("Dossier chargé.")} className="bg-slate-900 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4"/> Dossier Patient
                            </button>
                            <button onClick={() => showNotif("Appel en cours...")} className="bg-blue-50 text-blue-600 p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                                <Video className="w-4 h-4"/> Télé-expertise
                            </button>
                            <button onClick={() => finishConsultation(currentPatient.id)} className="bg-emerald-600 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                                Terminer Visite
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border border-slate-200">
                        <h3 className="text-xl font-black text-slate-900 mb-8 px-2">File d'attente du jour</h3>
                        <div className="space-y-4">
                            {filteredPatients.filter(p => p.status !== 'in_progress').map(p => (
                                <div key={p.id} className={`flex items-center justify-between p-5 rounded-[24px] border transition-all group ${p.status === 'finished' ? 'bg-slate-50/50 border-transparent grayscale' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
                                    <div className="flex items-center gap-6">
                                        <span className="font-mono text-slate-300 font-black text-sm">{p.time}</span>
                                        <div>
                                            <p className="font-black text-slate-800">{p.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{p.reason}</p>
                                        </div>
                                    </div>
                                    {p.status === 'finished' ? (
                                        <CheckCircle className="text-emerald-500 w-6 h-6 mr-4" />
                                    ) : (
                                        <button onClick={() => showNotif(`Appel de ${p.name}...`)} className="bg-slate-50 text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">Appeler</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Stats & Requests */}
                <div className="md:col-span-4 space-y-8">
                    <div className="bg-emerald-600 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 tracking-tight"><Clock className="w-5 h-5" /> Recap Journalier</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10">
                                <span className="text-xs font-bold uppercase text-emerald-100">Visites terminées</span>
                                <span className="text-xl font-black">{patients.filter(p=>p.status==='finished').length}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10">
                                <span className="text-xs font-bold uppercase text-emerald-100">En attente</span>
                                <span className="text-xl font-black">{patients.filter(p=>p.status==='waiting').length}</span>
                            </div>
                        </div>
                        <button onClick={() => setActiveTab('planning')} className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors">Ouvrir Planning</button>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-black text-slate-900">Demandes</h3>
                            <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[10px] font-black">{appointments.filter(a=>a.status==='pending').length}</span>
                        </div>
                        <div className="space-y-4">
                            {appointments.filter(a => a.status === 'pending').map(a => (
                                <div key={a.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 animate-in zoom-in-95 duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-slate-800">{a.patient}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{a.role}</p>
                                        </div>
                                        <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg text-slate-500 shadow-sm">{a.time}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRdvAction(a.id, 'confirm')} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all">Accepter</button>
                                        <button onClick={() => handleRdvAction(a.id, 'reject')} className="flex-1 py-3 bg-white text-red-500 border border-slate-100 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-all">Refuser</button>
                                    </div>
                                </div>
                            ))}
                            {appointments.filter(a=>a.status==='pending').length === 0 && (
                                <div className="text-center py-10 opacity-30 flex flex-col items-center gap-3">
                                    <Calendar className="w-10 h-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Aucune demande</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        ) : (
            <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center text-center shadow-sm border border-slate-200 min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-slate-50 p-8 rounded-[32px] mb-8"><Activity className="w-12 h-12 text-slate-300" /></div>
                 <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Section {activeTab}</h2>
                 <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">Ce module est synchronisé avec les données temps réel du réseau MediGo.</p>
                 <button onClick={() => setActiveTab('dashboard')} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all">Retour</button>
            </div>
        )}
      </main>
    </div>
  );
}
