'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface StockItem {
  stock_id: number;
  name: string;
  category: string;
  price: string;
  quantity: number;
}

interface Medication {
  id: number;
  name: string;
  category: string;
}

export default function Stocks() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [pharmacyName, setPharmacyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStocks = async (id: number) => {
    try {
      const response = await api.get(`/pharmacies/${id}/stocks`);
      const data = await response.json();
      setStocks(Array.isArray(data) ? (data as StockItem[]) : []);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      setStocks([]);
    }
  };

  const fetchAllMedications = async () => {
    try {
      const response = await api.get('/medications');
      const data = await response.json();
      setAllMedications(data as Medication[]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setPharmacyName(user.pharmacy_name);
        setPharmacyId(user.pharmacy_id);
        fetchStocks(user.pharmacy_id);
        fetchAllMedications();
      }
    };
    init();
  }, []);

  const deleteStock = async (stockId: number) => {
    if (!confirm("Supprimer ce médicament ?")) return;
    try {
      const response = await api.delete(`/stocks/${stockId}`);
      if (response.ok && pharmacyId) fetchStocks(pharmacyId);
    } catch (error) { console.error(error); }
  };

  const addMedicationToStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const response = await api.post('/stocks', { 
        pharmacy_id: pharmacyId, 
        medication_id: parseInt(formData.get('medication_id') as string), 
        quantity: parseInt(formData.get('quantity') as string),
        price: parseFloat(formData.get('price') as string)
      });
      if (response.ok) {
        setShowAddForm(false);
        if (pharmacyId) fetchStocks(pharmacyId);
      }
    } catch (error) { console.error(error); }
  };

  const filteredStocks = stocks.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-95">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Stocks</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{pharmacyName}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 text-white p-3 md:px-6 md:py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <Plus className={`w-6 h-6 transition-transform ${showAddForm ? 'rotate-45' : ''}`} /> 
            <span className="hidden md:inline">Ajouter</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher dans l&apos;inventaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-700 shadow-inner"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {showAddForm && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={addMedicationToStock} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Médicament</label>
                <select name="medication_id" required className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700">
                  <option value="">Sélectionnez un médicament</option>
                  {allMedications.map(med => (
                    <option key={med.id} value={med.id}>{med.name} ({med.category})</option>
                  ))}
                </select>
              </div>
              <input name="price" type="number" required placeholder="Prix" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 font-bold" />
              <input name="quantity" type="number" required placeholder="Quantité" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 font-bold" />
              <button type="submit" className="bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all">Enregistrer</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((item) => (
            <div key={item.stock_id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <Package className="text-slate-400 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base leading-tight">{item.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
                <button onClick={() => deleteStock(item.stock_id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                <p className="text-xl font-black text-slate-900">{parseFloat(item.price).toLocaleString()} F</p>
                <span className={`text-sm font-black px-2 py-1 rounded-lg ${item.quantity < 20 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.quantity} units</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
