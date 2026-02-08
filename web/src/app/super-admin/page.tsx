'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, TrendingUp, ShoppingBag, 
  CheckCircle2, XCircle, ShieldCheck, Search, 
  MoreVertical, RefreshCw, BadgeCheck, AlertTriangle 
} from 'lucide-react';
import { api } from '@/lib/api';

interface Stats {
  users: number;
  pharmacies: number;
  orders: number;
  revenue: number;
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_verified: boolean;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      const pharmRes = await api.get('/admin/pharmacies');
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (pharmRes.ok) setPharmacies(await pharmRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleVerify = async (id: number, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/admin/pharmacies/${id}/verify`, { is_verified: !currentStatus });
      if (res.ok) {
        setPharmacies(pharmacies.map(p => p.id === id ? { ...p, is_verified: !currentStatus } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white pt-8 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Super Admin</h1>
              <p className="text-slate-400 font-medium">Vue d&apos;ensemble du système MediGo</p>
            </div>
            <button onClick={fetchData} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Utilisateurs', value: stats?.users || 0, icon: <Users className="text-blue-400" />, change: "+12%" },
              { label: 'Pharmacies', value: stats?.pharmacies || 0, icon: <Building2 className="text-emerald-400" />, change: "+3" },
              { label: 'Commandes', value: stats?.orders || 0, icon: <ShoppingBag className="text-purple-400" />, change: "+8%" },
              { label: 'Volume (F CFA)', value: (stats?.revenue || 0).toLocaleString(), icon: <TrendingUp className="text-amber-400" />, change: "+24%" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-700/50 rounded-xl">{stat.icon}</div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">{stat.change}</span>
                </div>
                <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 -mt-12">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Gestion des Pharmacies
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Rechercher une pharmacie..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Pharmacie</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Date d&apos;ajout</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black">
                          {pharmacy.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1">
                            {pharmacy.name}
                            {pharmacy.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{pharmacy.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pharmacy.is_verified ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Vérifiée
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {pharmacy.phone || 'Non renseigné'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(pharmacy.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleVerify(pharmacy.id, pharmacy.is_verified)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                          pharmacy.is_verified 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                        }`}
                      >
                        {pharmacy.is_verified ? 'Révoquer' : 'Valider'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPharmacies.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Aucune pharmacie trouvée.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}