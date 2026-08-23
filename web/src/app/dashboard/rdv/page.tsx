'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ArrowLeft, CheckCircle2, XCircle, User, Calendar as CalendarIcon, RefreshCw, Phone } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Appointment {
  id: number;
  reason: string;
  appointment_date?: string;
  date?: string;
  status: string;
  pharmacy_name?: string;
  patient_name?: string;
  patient_phone?: string;
}

export default function DashboardRDV() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pharmacyName, setPharmacyName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setPharmacyName(user.pharmacy_name || 'Ma Pharmacie');
    }
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Rendez-vous</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{pharmacyName}</p>
            </div>
          </div>
          <button onClick={fetchAppointments} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-4">
        {appointments.map((app) => {
          const appDate = app.appointment_date || app.date || new Date().toISOString();
          return (
            <div key={app.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 group">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base leading-tight">
                      {app.patient_name || `Patient #${app.id}`}
                    </p>
                    {app.patient_phone && (
                      <p className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {app.patient_phone}
                      </p>
                    )}
                    <p className="text-xs font-medium text-slate-500 mt-1">{app.reason}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                  app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {app.status === 'pending' ? 'En attente' : app.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
                  </div>
                  <p className="text-xs font-black text-slate-700">{new Date(appDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Heure</span>
                  </div>
                  <p className="text-xs font-black text-slate-700">{new Date(appDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {app.status === 'pending' ? (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                    className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-black text-xs hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accepter
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-black text-xs hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Décliner
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500">
                  {app.status === 'confirmed' ? 'Rendez-vous validé' : 'Rendez-vous décliné'}
                </div>
              )}
            </div>
          );
        })}

        {appointments.length === 0 && !loading && (
          <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border border-slate-100 text-slate-400 font-bold">
            Aucun rendez-vous pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
