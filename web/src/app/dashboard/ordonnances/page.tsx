'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Clock, CheckCircle2, XCircle, ArrowLeft, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Prescription {
  id: number;
  image_url: string;
  patient_name: string;
  status: string;
  created_at: string;
}

export default function DashboardOrdonnances() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const response = await api.get(`/pharmacies/${user.pharmacy_id}/prescriptions`);
      const data = await response.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await api.patch(`/prescriptions/${id}`, { status });

      if (response.ok) {
        fetchPrescriptions(); 
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100 px-4 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Ordonnances</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((pres) => (
              <div key={pres.id} className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all hover:shadow-xl">
                <div className="h-64 bg-slate-200 relative overflow-hidden">
                  <Image src={pres.image_url} alt="Ordonnance" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6 pb-14">
                    <a href={pres.image_url} target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                      <ExternalLink className="w-4 h-4" /> Agrandir
                    </a>
                  </div>
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg ${
                    pres.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-500 text-white'
                  }`}>
                    {pres.status === 'pending' ? 'À traiter' : pres.status}
                  </div>
                </div>
                <div className="p-6 space-y-5 flex-1 bg-white relative z-10 -mt-8 rounded-t-[32px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                        <User className="w-4 h-4 text-emerald-500" /> {pres.patient_name}
                      </p>
                      <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> {new Date(pres.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(pres.id, 'Prête')}
                      className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-xs hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Valider
                    </button>
                    <button 
                      onClick={() => updateStatus(pres.id, 'Annulée')}
                      className="p-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-100 active:scale-95 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {prescriptions.length === 0 && !loading && (
          <div className="bg-white p-20 rounded-[40px] text-center shadow-sm border border-slate-100 text-slate-300 font-bold">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-20" />
            Aucune nouvelle ordonnance.
          </div>
        )}
      </div>
    </div>
  );
}
