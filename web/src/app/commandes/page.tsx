'use client';

import React, { useState, useEffect } from 'react';
import { Pill, MapPin, ArrowLeft, Package, Calendar, Camera, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Reservation {
  id: number;
  quantity: number;
  status: string;
  created_at: string;
  pharmacy_name: string;
  pharmacy_address: string;
  medication_name: string;
  price: string;
}

interface Appointment {
  id: number;
  date: string;
  reason: string;
  status: string;
  pharmacy_name: string;
  pharmacy_address: string;
}

interface Prescription {
  id: number;
  image_url: string;
  status: string;
  created_at: string;
  patient_phone: string;
}

export default function Commandes() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'prescriptions' | 'appointments'>('reservations');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResponse, appResponse, presResponse] = await Promise.all([
          api.get('/reservations'),
          api.get('/appointments'),
          api.get('/pharmacies/1/prescriptions') // Note: pharmacy 1 as default for now
        ]);
        
        setReservations(await resResponse.json());
        setAppointments(await appResponse.json());
        setPrescriptions(await presResponse.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': case 'Prête': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'Prête': return 'Prête';
      default: return status;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-100">
              <Pill className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">MediGo</span>
          </Link>
          <Link href="/" className="p-2 bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Mon Suivi Santé</h1>
          <p className="text-sm text-slate-500 font-medium">Historique de vos soins et commandes</p>
        </div>

        {/* Tabs Mobile-Optimized */}
        <div className="flex gap-1 mb-8 bg-slate-200/50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {(['reservations', 'prescriptions', 'appointments'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'reservations' ? 'Achats' : tab === 'prescriptions' ? 'Ordonnances' : 'RDV'}
              <span className="ml-1.5 opacity-50 font-medium">
                ({tab === 'reservations' ? reservations.length : tab === 'prescriptions' ? prescriptions.length : appointments.length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoaderIcon /></div>
        ) : activeTab === 'reservations' ? (
          <div className="space-y-4">
            {reservations.map((res) => (
              <div key={res.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-3 rounded-2xl"><Pill className="text-emerald-600 w-5 h-5" /></div>
                    <div>
                      <h3 className="font-black text-slate-800 text-sm">{res.medication_name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">REF: #RES-{res.id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusColor(res.status)}`}>
                    {getStatusLabel(res.status)}
                  </span>
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                      <MapPin className="w-3 h-3 text-emerald-500" /> {res.pharmacy_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> {new Date(res.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className="text-lg font-black text-slate-900">{parseFloat(res.price).toLocaleString()} F</span>
                </div>
              </div>
            ))}
            {reservations.length === 0 && <EmptyState message="Aucun achat" />}
          </div>
        ) : activeTab === 'prescriptions' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prescriptions.map((pres) => (
              <div key={pres.id} className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden flex flex-col group">
                <div className="h-48 bg-slate-100 relative">
                  <Image src={pres.image_url} alt="Ordonnance" fill className="object-cover transition-transform group-hover:scale-105" />
                  <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg ${getStatusColor(pres.status)}`}>
                    {getStatusLabel(pres.status)}
                  </div>
                </div>
                <div className="p-5 flex justify-between items-center bg-white">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">REF: #ORD-{pres.id}</p>
                    <p className="text-xs font-black text-slate-700">{new Date(pres.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                  </div>
                  <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {prescriptions.length === 0 && <EmptyState message="Aucune photo" icon={<Camera className="w-10 h-10 text-slate-200" />} />}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div key={app.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-2xl"><Calendar className="text-blue-600 w-5 h-5" /></div>
                    <div>
                      <h3 className="font-black text-slate-800 text-sm truncate max-w-[150px]">{app.reason}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RDV Santé</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusColor(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                    <MapPin className="w-3 h-3 text-blue-500" /> {app.pharmacy_name}
                  </div>
                  <div className="text-[11px] font-black text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">
                    {new Date(app.date).toLocaleString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <EmptyState message="Aucun rendez-vous" icon={<Calendar className="w-10 h-10 text-slate-200" />} />}
          </div>
        )}
      </section>
    </main>
  );
}

function LoaderIcon() {
  return <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>;
}

function EmptyState({ message, icon }: { message: string, icon?: React.ReactNode }) {
  return (
    <div className="bg-white p-12 rounded-[40px] text-center shadow-sm border border-slate-100">
      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || <Package className="text-slate-200 w-8 h-8" />}
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-1 tracking-tight">{message}</h3>
      <Link href="/" className="text-xs text-emerald-600 font-bold hover:underline">Retourner au catalogue</Link>
    </div>
  );
}
