'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ArrowLeft, CheckCircle2, XCircle, User, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: number;
  reason: string;
  date: string;
  status: string;
  pharmacy_name: string;
}

export default function DashboardRDV() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pharmacyName, setPharmacyName] = useState('');

  useEffect(() => {
    const init = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setPharmacyName(user.pharmacy_name);
        fetchAppointments(user.pharmacy_name);
      }
    };

    const fetchAppointments = async (name: string) => {
      try {
        const response = await fetch(`http://localhost:3001/api/appointments`);
        const data = await response.json();
        const myApp = (data as Appointment[]).filter((a: Appointment) => a.pharmacy_name === name);
        setAppointments(myApp);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Rendez-vous</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{pharmacyName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-4">
        {appointments.map((app) => (
          <div key={app.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 group">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base leading-tight">Patient #{app.id}</p>
                  <p className="text-xs font-bold text-slate-400">{app.reason}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                app.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {app.status === 'pending' ? 'En attente' : 'Confirmé'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
                </div>
                <p className="text-xs font-black text-slate-700">{new Date(app.date).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Heure</span>
                </div>
                <p className="text-xs font-black text-slate-700">{new Date(app.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-black text-xs hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Accepter
              </button>
              <button className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-black text-xs hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Décliner
              </button>
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border border-slate-100 text-slate-300 font-bold">
            Aucun rendez-vous aujourd&apos;hui.
          </div>
        )}
      </div>
    </div>
  );
}