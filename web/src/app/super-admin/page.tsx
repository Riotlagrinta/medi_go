'use client';

import React, { useState, useEffect } from 'react';
import { Pill, Plus, MapPin, Phone, ShieldCheck, Trash2, Globe, Activity } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_on_duty: boolean;
  is_verified: boolean;
}

export default function SuperAdmin() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPharmacy, setNewPharmacy] = useState({ name: '', address: '', phone: '', email: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase.from('pharmacies').select('*').order('name');
      if (error) throw error;
      setPharmacies((data as Pharmacy[]) || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.role === 'super_admin') {
        setIsAuthorized(true);
        fetchPharmacies();
      } else {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const toggleStatus = async (id: number, field: 'is_verified' | 'is_on_duty', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('pharmacies')
        .update({ [field]: !currentValue })
        .eq('id', id);
      if (error) throw error;
      fetchPharmacies();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const deletePharmacy = async (id: number) => {
    if (!confirm("Supprimer définitivement cette pharmacie ?")) return;
    try {
      const { error } = await supabase.from('pharmacies').delete().eq('id', id);
      if (error) throw error;
      fetchPharmacies();
    } catch (err) { alert("Erreur suppression"); }
  };

  const handleAddPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('pharmacies')
        .insert([{ name: newPharmacy.name, address: newPharmacy.address, phone: newPharmacy.phone }])
        .select();

      if (error) throw error;
      alert(`Pharmacie créée !`);
      setShowAddForm(false);
      setNewPharmacy({ name: '', address: '', phone: '', email: '' });
      fetchPharmacies();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  if (!isAuthorized) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-20">
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">MediGo Central</h1>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Administration Système</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:block text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Voir le site public
            </Link>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white text-slate-950 p-3 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Plus className={`w-6 h-6 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Réseau</p>
            <p className="text-2xl font-black">{pharmacies.length}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">En Garde</p>
            <p className="text-2xl font-black text-emerald-500">{pharmacies.filter(p => p.is_on_duty).length}</p>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-slate-900 p-6 rounded-[32px] border border-white/10 mb-8 animate-in zoom-in duration-300">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" /> Nouvel établissement
            </h2>
            <form onSubmit={handleAddPharmacy} className="flex flex-col gap-4">
              <input placeholder="Nom de la pharmacie" required value={newPharmacy.name} onChange={e => setNewPharmacy({...newPharmacy, name: e.target.value})} className="bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
              <input placeholder="Email gérant" type="email" required value={newPharmacy.email} onChange={e => setNewPharmacy({...newPharmacy, email: e.target.value})} className="bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
              <input placeholder="Téléphone" required value={newPharmacy.phone} onChange={e => setNewPharmacy({...newPharmacy, phone: e.target.value})} className="bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
              <input placeholder="Adresse" required value={newPharmacy.address} onChange={e => setNewPharmacy({...newPharmacy, address: e.target.value})} className="bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
              <button type="submit" className="bg-emerald-500 text-slate-950 py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-2">
                Créer l&apos;accès
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacies.map(p => (
            <div key={p.id} className="bg-slate-900/50 p-5 rounded-[28px] border border-white/5 hover:border-emerald-500/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-800 p-3 rounded-2xl group-hover:bg-emerald-500 transition-colors">
                  <Pill className="text-emerald-500 group-hover:text-slate-900 w-6 h-6 transition-colors" />
                </div>
                <button 
                  onClick={() => deletePharmacy(p.id)}
                  className="p-2 text-slate-600 hover:text-red-500 active:scale-90 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-black text-lg tracking-tight">{p.name}</h3>
                {p.is_verified && <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />}
              </div>
              <div className="space-y-2 mb-6">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><MapPin className="w-3.5 h-3.5" /> {p.address}</p>
                <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Phone className="w-3.5 h-3.5" /> {p.phone}</p>
              </div>
              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center">
                <button 
                  onClick={() => toggleStatus(p.id, 'is_on_duty', p.is_on_duty)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    p.is_on_duty ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {p.is_on_duty ? 'En Garde' : 'Mettre de Garde'}
                </button>
                <button 
                  onClick={() => toggleStatus(p.id, 'is_verified', p.is_verified)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    p.is_verified ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {p.is_verified ? 'Certifiée' : 'Certifier'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
