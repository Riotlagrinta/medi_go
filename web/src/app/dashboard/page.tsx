'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Package, Clock, Users, 
  AlertTriangle, ArrowUpRight, FileText, 
  Download, Filter, Calendar, Pill
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Stats {
  total_revenue: number;
  transaction_count: number;
  generated_at: string;
  transactions: any[];
}

export default function PharmacieDashboard() {
  const [report, setReport] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pharmacyName, setPharmacyName] = useState('Ma Pharmacie');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setPharmacyName(user.pharmacy_name || 'Ma Pharmacie');
    }

    const fetchReport = async () => {
      try {
        const res = await api.get('/reports/sales');
        if (res.ok) setReport(await res.json());
      } catch (err) {
        console.error("Erreur chargement rapport:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Dashboard</span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{pharmacyName}</h1>
            </div>
            <p className="text-slate-500 font-medium">Gestion et statistiques en temps réel</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <FileText className="w-5 h-5" /> Exporter PDF
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Ventes du jour', value: `${(report?.total_revenue || 0).toLocaleString()} F`, icon: <TrendingUp className="text-emerald-500" />, trend: '+14%', color: 'bg-emerald-50' },
            { label: 'Commandes', value: report?.transaction_count || 0, icon: <Package className="text-blue-500" />, trend: '+2', color: 'bg-blue-50' },
            { label: 'Stock Faible', value: '4', icon: <AlertTriangle className="text-amber-500" />, trend: '-10%', color: 'bg-amber-50' },
            { label: 'Patients', value: '128', icon: <Users className="text-purple-500" />, trend: '+5%', color: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-4 rounded-2xl`}>{stat.icon}</div>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  {stat.trend} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sales Table */}
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">Dernières Transactions</h2>
              <button className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all">Voir tout</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4 text-left">Date</th>
                    <th className="px-8 py-4 text-left">Produit</th>
                    <th className="px-8 py-4 text-right">Montant</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report?.transactions.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Pill className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-sm font-black text-slate-800">{t.item}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {t.amount.toLocaleString()} F
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Payé</span>
                      </td>
                    </tr>
                  ))}
                  {!report?.transactions.length && (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">Aucune transaction aujourd'hui</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
               <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                 <Download className="w-5 h-5 text-emerald-400" /> Actions Rapides
               </h3>
               <div className="grid grid-cols-1 gap-3">
                 <Link href="/dashboard/stocks" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                    <span className="font-bold">Gérer les stocks</span>
                    <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <Link href="/dashboard/ordonnances" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                    <span className="font-bold">Traitement ordonnances</span>
                    <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <Link href="/dashboard/rdv" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                    <span className="font-bold">Consulter les RDV</span>
                    <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                 </Link>
               </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-800">Alertes Stock</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Doliprane 500mg', qty: 4 },
                  { name: 'Insuline Novomix', qty: 2 }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                    <span className="text-xs font-black text-amber-600 bg-white px-2 py-1 rounded-lg">{item.qty} restants</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
  </svg>
);
