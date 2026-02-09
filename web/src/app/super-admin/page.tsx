'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, TrendingUp, ShoppingBag, 
  CheckCircle2, XCircle, ShieldCheck, Search, 
  MoreVertical, RefreshCw, BadgeCheck, AlertTriangle,
  UserPlus, UserCog, Mail, Phone as PhoneIcon
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

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  pharmacy_id: number | null;
  pharmacies?: { name: string };
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'users'>('pharmacies');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      const pharmRes = await api.get('/admin/pharmacies');
      const usersRes = await api.get('/admin/users');
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (pharmRes.ok) setPharmacies(await pharmRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
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

  const updateUserRole = async (userId: number, role: string, pharmacyId: number | null) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role, pharmacy_id: pharmacyId });
      if (res.ok) {
        fetchData(); // Recharger pour voir les noms de pharmacies mis à jour
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = activeTab === 'pharmacies' 
    ? pharmacies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white pt-8 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Super Admin</h1>
              <p className="text-slate-400 font-medium">Gestion centrale de MediGo</p>
            </div>
            <button onClick={fetchData} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Utilisateurs', value: stats?.users || 0, icon: <Users className="text-blue-400" /> },
              { label: 'Pharmacies', value: stats?.pharmacies || 0, icon: <Building2 className="text-emerald-400" /> },
              { label: 'Commandes', value: stats?.orders || 0, icon: <ShoppingBag className="text-purple-400" /> },
              { label: 'CA Total (F)', value: (stats?.revenue || 0).toLocaleString(), icon: <TrendingUp className="text-amber-400" /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="p-3 bg-slate-700/50 rounded-xl w-fit mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 -mt-12">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
            <button 
              onClick={() => setActiveTab('pharmacies')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all ${activeTab === 'pharmacies' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Building2 className="w-5 h-5" /> Pharmacies
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users className="w-5 h-5" /> Utilisateurs
            </button>
          </div>

          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-slate-800">
              {activeTab === 'pharmacies' ? 'Toutes les Pharmacies' : 'Répertoire des Membres'}
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={activeTab === 'pharmacies' ? "Rechercher une pharmacie..." : "Nom ou email..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'pharmacies' ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Pharmacie</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                           {p.name}
                           {p.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.is_verified ? 'Vérifiée' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleVerify(p.id, p.is_verified)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${p.is_verified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                          {p.is_verified ? 'Révoquer' : 'Valider'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Lien Pharmacie</th>
                    <th className="px-6 py-4 text-right">Promouvoir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs">{u.full_name?.charAt(0)}</div>
                           <div>
                             <p className="font-bold text-slate-900">{u.full_name}</p>
                             <p className="text-[10px] text-slate-400">{u.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'pharmacy_admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">
                        {u.pharmacies?.name || '---'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={u.pharmacy_id || ''} 
                          onChange={(e) => updateUserRole(u.id, 'pharmacy_admin', e.target.value ? parseInt(e.target.value) : null)}
                          className="bg-slate-100 border-none rounded-lg text-[10px] font-black py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Patient</option>
                          {pharmacies.map(p => (
                            <option key={p.id} value={p.id}>Admin: {p.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
