'use client';

import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, XCircle, Clock, Eye, AlertCircle, RefreshCw, Send, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface Prescription {
  id: number;
  image_url: string;
  status: 'pending' | 'ready' | 'rejected' | 'picked_up';
  created_at: string;
  users: {
    full_name: string;
    phone: string;
  };
}

export default function OrdonnancesPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions');
      if (res.ok) setPrescriptions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await api.patch(`/prescriptions/${id}/status`, { status });
      if (res.ok) {
        setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: status as any } : p));
        // Ici on pourrait afficher une notification "SMS envoyé !"
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen bg-slate-50">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ordonnances</h1>
          <p className="text-slate-500 font-medium">Gérez les demandes reçues par photo</p>
        </div>
        <button onClick={fetchPrescriptions} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-[32px] animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Image Preview */}
              <div 
                className="h-48 bg-slate-100 relative cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(p.image_url)}
              >
                <img src={p.image_url} alt="Ordonnance" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-lg" />
                </div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  p.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {p.status === 'pending' ? 'En attente' : p.status === 'ready' ? 'Prête' : 'Rejetée'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900 text-lg">{p.users?.full_name || 'Patient inconnu'}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {new Date(p.created_at).toLocaleDateString()} à {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                  {p.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => updateStatus(p.id, 'rejected')}
                        className="py-3 px-4 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Rejeter
                      </button>
                      <button 
                        onClick={() => updateStatus(p.id, 'ready')}
                        className="py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Valider
                      </button>
                    </>
                  ) : p.status === 'ready' ? (
                     <button 
                        onClick={() => updateStatus(p.id, 'picked_up')}
                        className="col-span-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Marquer comme récupérée
                      </button>
                  ) : (
                    <div className="col-span-2 text-center text-sm text-slate-400 font-medium py-3 bg-slate-50 rounded-xl">
                      Traitement terminé
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
               <Camera className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg font-medium">Aucune ordonnance reçue pour le moment.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal Image */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-8 right-8 text-white hover:text-red-400 transition-colors p-2 bg-white/10 rounded-full">
            <XCircle className="w-8 h-8" />
          </button>
          <img src={selectedImage} alt="Zoom" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl scale-100 transition-transform" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}