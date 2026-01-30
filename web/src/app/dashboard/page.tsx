'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill, LayoutDashboard, Package, Calendar, Settings, 
  LogOut, Bell, Clock, CheckCircle2, XCircle, 
  Power, Camera, MessageSquare 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface Pharmacy {
  id: number;
  name: string;
}

interface Reservation {
  id: string;
  medication_name: string;
  pharmacy_name: string;
  quantity: number;
  created_at: string;
  status: string;
}

interface UserSession {
  id: number;
  email: string;
  role: string;
  full_name: string;
  pharmacy_id: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/connexion');
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (!response.ok) throw new Error('Invalid session');
        
        const userData = await response.json();
        
        // SÉCURITÉ : Si l'utilisateur est un patient, il n'a rien à faire ici
        if (userData.role === 'patient') {
          router.push('/');
          return;
        }

        setUser(userData);
        fetchData(userData);
      } catch (error) {
        localStorage.clear();
        router.push('/connexion');
      }
    };

    const fetchData = async (userData: UserSession) => {
      try {
        const [resResponse, msgResponse, pharmacyResponse] = await Promise.all([
          api.get('/reservations'),
          api.get(`/messages/${userData.pharmacy_id}`),
          api.get(`/pharmacies/${userData.pharmacy_id}`)
        ]);
        
        const [allRes, allMsgs, pharmacyData] = await Promise.all([
          resResponse.json(),
          msgResponse.json(),
          pharmacyResponse.json()
        ]);

        setReservations(allRes || []);
        
        const hasPatientMsg = Array.isArray(allMsgs) ? allMsgs.some((m: any) => !m.is_from_pharmacy) : false;
        if (hasPatientMsg) setUnreadCount(1);
        
        setPharmacy({ name: pharmacyData?.name || 'Ma Pharmacie', id: userData.pharmacy_id });
        setIsOnDuty(pharmacyData?.is_on_duty || false); 
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const toggleOnDuty = async () => {
    if (!pharmacy) return;
    try {
      const newStatus = !isOnDuty;
      const response = await api.patch(`/pharmacies/${pharmacy.id}`, { is_on_duty: newStatus });

      if (response.ok) {
        setIsOnDuty(newStatus);
      }
    } catch (error) {
      console.error('Failed to toggle on-duty status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/connexion');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row pb-20 lg:pb-0">
      <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Pill className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800">MediGo Pro</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/dashboard/stocks" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Package className="w-5 h-5" /> Stocks
          </Link>
          <Link href="/dashboard/chat" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" /> Messagerie
            </div>
            {unreadCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
          </Link>
          <Link href="/dashboard/ordonnances" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Camera className="w-5 h-5" /> Ordonnances
          </Link>
          <Link href="/dashboard/rdv" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Calendar className="w-5 h-5" /> Rendez-vous
          </Link>
          <Link href="/dashboard/parametres" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" /> Paramètres
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="lg:hidden bg-emerald-600 p-1.5 rounded-lg">
              <Pill className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold text-slate-800 truncate max-w-[150px] md:max-w-none">{pharmacy?.name}</h2>
              <p className="text-[10px] md:text-sm text-slate-500">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl">
              <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span className="hidden md:inline text-sm font-bold text-slate-700">{isOnDuty ? 'DE GARDE' : 'HORS GARDE'}</span>
              <button 
                onClick={toggleOnDuty}
                className={`p-1.5 rounded-lg transition-all ${isOnDuty ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="lg:hidden p-2 text-red-500 bg-red-50 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 flex items-center sm:block gap-4">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center sm:mb-4 text-blue-600 flex-shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">Réservations actives</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{reservations.length}</h3>
              </div>
            </div>
            <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 flex items-center sm:block gap-4">
              <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center sm:mb-4 text-amber-600 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">RDV aujourd&apos;hui</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">2</h3>
              </div>
            </div>
            <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 flex items-center sm:block gap-4">
              <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center sm:mb-4 text-emerald-600 flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">Chiffre d&apos;affaires (EST.)</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">45,000 F</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-base md:text-lg text-slate-800">Réservations récentes</h3>
              <button className="text-xs md:text-sm text-emerald-600 font-bold hover:underline">Tout voir</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px] sm:min-w-0">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Médicament</th>
                    <th className="hidden sm:table-cell px-6 py-4">Quantité</th>
                    <th className="hidden md:table-cell px-6 py-4">Date</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Array.isArray(reservations) && reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 text-sm block">{res.medication_name}</span>
                        <span className="sm:hidden text-[10px] text-slate-400">{res.quantity} unités</span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-slate-500 text-sm">{res.quantity} unités</td>
                      <td className="hidden md:table-cell px-6 py-4 text-slate-500 text-sm">
                        {new Date(res.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservations.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Aucune réservation pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around p-3 z-30 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-emerald-600">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </Link>
        <Link href="/dashboard/stocks" className="flex flex-col items-center gap-1 text-slate-400">
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-medium">Stocks</span>
        </Link>
        <Link href="/dashboard/chat" className="flex flex-col items-center gap-1 text-slate-400 relative">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Chat</span>
          {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/ordonnances" className="flex flex-col items-center gap-1 text-slate-400">
          <Camera className="w-6 h-6" />
          <span className="text-[10px] font-medium">Ordo</span>
        </Link>
        <Link href="/dashboard/parametres" className="flex flex-col items-center gap-1 text-slate-400">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  );
}