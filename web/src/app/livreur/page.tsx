'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Package, Phone, CheckCircle2, 
  Navigation, Clock, ChevronRight, LayoutDashboard,
  Wallet, ListTodo, Loader2, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

interface Delivery {
  id: number;
  pickup_address: string;
  delivery_address: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered';
  delivery_fee: number;
  reservations: {
    medications: {
      name: string;
    }
  };
}

export default function LivreurDashboard() {
  const [view, setView] = useState<'available' | 'active' | 'stats'>('available');
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/delivery/available');
      if (res.ok) setAvailableDeliveries(await res.json());
      
      // En prod, on chercherait aussi si le livreur a une course en cours
      // activeDelivery = ...
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptDelivery = async (delivery: Delivery) => {
    try {
      const res = await api.post(`/delivery/${delivery.id}/accept`, {});
      if (res.ok) {
        setActiveDelivery({ ...delivery, status: 'accepted' });
        setView('active');
        setAvailableDeliveries(prev => prev.filter(d => d.id !== delivery.id));
      }
    } catch (err) {
      alert("Erreur lors de l'acceptation");
    }
  };

  const updateStatus = async (status: Delivery['status']) => {
    if (!activeDelivery) return;
    try {
      const res = await api.patch(`/delivery/${activeDelivery.id}/status`, { status });
      if (res.ok) {
        if (status === 'delivered') {
          setActiveDelivery(null);
          setView('stats');
        } else {
          setActiveDelivery({ ...activeDelivery, status });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg"><Truck className="w-5 h-5 text-white" /></div>
            MediGo <span className="text-emerald-500">Fleet</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">En ligne</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 bg-white rounded-t-[40px] text-slate-900 p-6 pb-32">
        {view === 'available' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Courses disponibles</h2>
              <button onClick={fetchData} className="text-emerald-600 font-bold text-sm">Actualiser</button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : availableDeliveries.length > 0 ? (
              availableDeliveries.map((delivery) => (
                <div key={delivery.id} className="bg-slate-50 border border-slate-100 p-5 rounded-[32px] space-y-4 hover:bg-slate-100/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-3 rounded-2xl shadow-sm"><Package className="text-emerald-600 w-5 h-5" /></div>
                      <div>
                        <p className="font-black text-slate-800 text-lg leading-none">{delivery.reservations?.medications?.name || 'Médicaments'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nouveau colis</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-600 leading-none">{delivery.delivery_fee} F</p>
                      <p className="text-[10px] font-black text-slate-400">GAIN ESTIMÉ</p>
                    </div>
                  </div>

                  <div className="space-y-3 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                    <div className="flex items-center gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white border-4 border-emerald-500 z-10"></div>
                      <p className="text-xs font-bold text-slate-600 truncate">{delivery.pickup_address}</p>
                    </div>
                    <div className="flex items-center gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white border-4 border-slate-300 z-10"></div>
                      <p className="text-xs font-bold text-slate-600 truncate">{delivery.delivery_address}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => acceptDelivery(delivery)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    Accepter la course <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-slate-300 w-10 h-10" />
                </div>
                <p className="font-bold text-slate-400">Aucune course autour de vous.</p>
              </div>
            )}
          </div>
        )}

        {view === 'active' && activeDelivery && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-4 mb-8">
                <div className="bg-emerald-100 p-4 rounded-3xl"><Navigation className="text-emerald-600 w-8 h-8 animate-pulse" /></div>
                <div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">En cours</h2>
                   <p className="text-emerald-600 font-bold text-sm">
                      {activeDelivery.status === 'accepted' ? 'Allez à la pharmacie' : 'Allez chez le patient'}
                   </p>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6">Itinéraire de livraison</p>
                   
                   <div className="space-y-8 relative">
                      <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-white/10"></div>
                      <div className="flex items-start gap-6">
                         <div className={`w-4 h-4 rounded-full mt-1 ${activeDelivery.status === 'accepted' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`}></div>
                         <div className="flex-1">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Récupération</p>
                            <p className="font-bold text-lg">{activeDelivery.pickup_address}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-6">
                         <div className={`w-4 h-4 rounded-full mt-1 ${activeDelivery.status === 'picked_up' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`}></div>
                         <div className="flex-1">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Destination</p>
                            <p className="font-bold text-lg">{activeDelivery.delivery_address}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                {activeDelivery.status === 'accepted' ? (
                  <button 
                    onClick={() => updateStatus('picked_up')}
                    className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <Package className="w-6 h-6" /> J'ai récupéré le colis
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus('delivered')}
                    className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-6 h-6" /> Marquer comme livré
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                   <button className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> Appeler
                   </button>
                   <button className="bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" /> GPS
                   </button>
                </div>
             </div>
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-8">Mes Gains</h2>
            <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-100">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Solde disponible</p>
               <p className="text-4xl font-black tracking-tighter">12.500 F</p>
               <div className="mt-8 pt-6 border-t border-white/20 flex justify-between">
                  <div><p className="text-[10px] font-bold opacity-60">Aujourd'hui</p><p className="font-bold">4.500 F</p></div>
                  <div><p className="text-[10px] font-bold opacity-60">Courses</p><p className="font-bold">8</p></div>
                  <div><p className="text-[10px] font-bold opacity-60">Bonus</p><p className="font-bold">+500 F</p></div>
               </div>
            </div>
            
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg">Demander un retrait</button>
          </div>
        )}
      </main>

      {/* Navigation Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 flex justify-around items-center z-50">
        <button 
          onClick={() => setView('available')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'available' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <ListTodo className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Missions</span>
        </button>
        
        <button 
          onClick={() => setView('active')}
          className={`relative ${view === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <div className={`p-4 bg-white rounded-full shadow-lg border border-slate-50 -mt-12 transition-all ${view === 'active' ? 'bg-emerald-600 text-white' : ''}`}>
            <Navigation className="w-6 h-6" />
          </div>
          {activeDelivery && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-bounce"></div>}
        </button>

        <button 
          onClick={() => setView('stats')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'stats' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Wallet className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Gains</span>
        </button>
      </nav>
    </div>
  );
}
