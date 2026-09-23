'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, ArrowLeft, Package, Minus, Check, Upload, Sparkles, AlertTriangle } from 'lucide-react';
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

interface ImportEntry {
  name: string;
  price: number;
  quantity: number;
  medication_id: number | null;
  raw: string;
}

export default function Stocks() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [pharmacyName, setPharmacyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorized, setAuthorized] = useState(false);

  // Sélecteur de médicament avec recherche (remplace le <select> à ~290 options)
  const [medQuery, setMedQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);
  const medBoxRef = useRef<HTMLDivElement>(null);

  // Édition rapide de la quantité directement sur la carte (sans rouvrir le formulaire)
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [pendingStockId, setPendingStockId] = useState<number | null>(null);

  // Import en masse (CSV/Excel collé)
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<ImportEntry[] | null>(null);
  const [importUnmatched, setImportUnmatched] = useState<string[]>([]);
  const [importSelected, setImportSelected] = useState<Set<number>>(new Set());
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ updated: number; medicationsCreated: number } | null>(null);

  const fetchStocks = async (id: number, query = '') => {
    try {
      const response = await api.get(`/pharmacies/${id}/stocks?q=${query}`);
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
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.ok) {
          const user = await res.json();
          if (user.role === 'pharmacy_admin' || user.role === 'super_admin') {
            setPharmacyName(user.pharmacy_name);
            setPharmacyId(user.pharmacy_id);
            setAuthorized(true);
            fetchStocks(user.pharmacy_id);
            fetchAllMedications();
          } else {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/connexion';
        }
      } catch (err) {
        window.location.href = '/connexion';
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (authorized && pharmacyId) {
        fetchStocks(pharmacyId, searchQuery);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, authorized, pharmacyId]);

  // Ferme la liste de suggestions quand on clique en dehors du champ
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (medBoxRef.current && !medBoxRef.current.contains(e.target as Node)) {
        setShowMedSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMedSuggestions = medQuery.trim().length > 0
    ? allMedications
        .filter((m) => m.name.toLowerCase().includes(medQuery.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  const deleteStock = async (stockId: number) => {
    if (!confirm("Supprimer ce médicament ?")) return;
    try {
      const response = await api.delete(`/stocks/${stockId}`);
      if (response.ok && pharmacyId) fetchStocks(pharmacyId, searchQuery);
    } catch (error) { console.error(error); }
  };

  const addMedicationToStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const response = await api.post('/stocks', {
        pharmacy_id: pharmacyId,
        medication_id: selectedMed.id,
        quantity: parseInt(formData.get('quantity') as string),
        price: parseFloat(formData.get('price') as string)
      });
      if (response.ok) {
        setShowAddForm(false);
        setSelectedMed(null);
        setMedQuery('');
        if (pharmacyId) fetchStocks(pharmacyId, searchQuery);
      }
    } catch (error) { console.error(error); }
  };

  // Ajustement rapide ±1 (vente au comptoir, correction ponctuelle) : mise à jour
  // optimiste de l'affichage, appel API en arrière-plan.
  const nudgeQuantity = async (stockId: number, delta: number) => {
    setStocks((prev) => prev.map((s) => (s.stock_id === stockId ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s)));
    setPendingStockId(stockId);
    try {
      await api.patch(`/stocks/${stockId}`, { delta });
    } catch (error) {
      console.error(error);
      if (pharmacyId) fetchStocks(pharmacyId, searchQuery); // resynchronise en cas d'échec
    } finally {
      setPendingStockId(null);
    }
  };

  const startEditingQuantity = (item: StockItem) => {
    setEditingStockId(item.stock_id);
    setEditValue(String(item.quantity));
  };

  // Édition en ligne : on retape le nouveau total (ex: après un réassort), plus
  // rapide que de rouvrir tout le formulaire pour un produit déjà en stock.
  const confirmEditQuantity = async (stockId: number) => {
    const newQuantity = parseInt(editValue, 10);
    setEditingStockId(null);
    if (Number.isNaN(newQuantity)) return;
    setStocks((prev) => prev.map((s) => (s.stock_id === stockId ? { ...s, quantity: Math.max(0, newQuantity) } : s)));
    setPendingStockId(stockId);
    try {
      await api.patch(`/stocks/${stockId}`, { quantity: newQuantity });
    } catch (error) {
      console.error(error);
      if (pharmacyId) fetchStocks(pharmacyId, searchQuery);
    } finally {
      setPendingStockId(null);
    }
  };

  const analyzeImport = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await api.post('/stocks/import/preview', { text: importText });
      if (res.ok) {
        const data = await res.json();
        const entries = data.entries as ImportEntry[];
        setImportPreview(entries);
        setImportUnmatched(data.unmatched || []);
        setImportSelected(new Set(entries.map((_, i) => i)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImportLoading(false);
    }
  };

  const toggleImportEntry = (index: number) => {
    setImportSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const applyImport = async () => {
    if (!importPreview || !pharmacyId) return;
    setImportLoading(true);
    try {
      const entries = importPreview.filter((_, i) => importSelected.has(i));
      const res = await api.post('/stocks/import/apply', { pharmacy_id: pharmacyId, entries });
      if (res.ok) {
        const data = await res.json();
        setImportResult(data);
        setImportPreview(null);
        setImportUnmatched([]);
        setImportText('');
        fetchStocks(pharmacyId, searchQuery);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImportLoading(false);
    }
  };

  if (!authorized) return null;

  const filteredStocks = stocks;

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowImportPanel(!showImportPanel); setShowAddForm(false); }}
              className="bg-slate-900 text-white p-3 md:px-5 md:py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Upload className="w-5 h-5" />
              <span className="hidden md:inline">Importer</span>
            </button>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setShowImportPanel(false); }}
              className="bg-emerald-600 text-white p-3 md:px-6 md:py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
            >
              <Plus className={`w-6 h-6 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
              <span className="hidden md:inline">Ajouter</span>
            </button>
          </div>
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
              <div className="md:col-span-3 relative" ref={medBoxRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Médicament</label>
                <input
                  type="text"
                  required
                  placeholder="Tapez pour chercher un médicament..."
                  value={selectedMed ? selectedMed.name : medQuery}
                  onChange={(e) => {
                    setSelectedMed(null);
                    setMedQuery(e.target.value);
                    setShowMedSuggestions(true);
                  }}
                  onFocus={() => setShowMedSuggestions(true)}
                  className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700"
                />
                {showMedSuggestions && filteredMedSuggestions.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-64 overflow-y-auto">
                    {filteredMedSuggestions.map((med) => (
                      <button
                        type="button"
                        key={med.id}
                        onClick={() => {
                          setSelectedMed(med);
                          setMedQuery('');
                          setShowMedSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="font-bold text-slate-700 text-sm">{med.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">{med.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input name="price" type="number" required placeholder="Prix" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 font-bold" />
              <input name="quantity" type="number" required placeholder="Quantité" className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 font-bold" />
              <button type="submit" disabled={!selectedMed} className="bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Enregistrer</button>
            </form>
          </div>
        )}

        {showImportPanel && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 space-y-5">
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Colle une ligne par médicament au format <span className="font-mono font-bold">nom ; prix ; quantité</span>{' '}
                (export Excel/Google Sheets, virgule ou point-virgule accepté). Un médicament inconnu de MediGo sera créé
                automatiquement. Vérifie toujours l&apos;aperçu avant de confirmer.
              </p>
            </div>

            {!importPreview ? (
              <div className="space-y-4">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={8}
                  placeholder={'Doliprane 1000mg;1500;42\nAmoxicilline 500mg;2500;15\nParacétamol Sirop;1200;8'}
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={analyzeImport}
                  disabled={importLoading || !importText.trim()}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {importLoading ? 'Analyse...' : 'Analyser'}
                </button>

                {importResult && (
                  <div className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl text-sm font-bold">
                    ✅ {importResult.updated} ligne(s) de stock mise(s) à jour
                    {importResult.medicationsCreated > 0 && `, ${importResult.medicationsCreated} nouveau(x) médicament(s) créé(s)`}.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-bold text-slate-600">
                    {importSelected.size} / {importPreview.length} ligne(s) sélectionnée(s)
                    {importUnmatched.length > 0 && (
                      <span className="text-amber-600"> · {importUnmatched.length} ligne(s) non reconnue(s)</span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setImportPreview(null); setImportUnmatched([]); }}
                      className="px-4 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={applyImport}
                      disabled={importLoading || importSelected.size === 0}
                      className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> {importLoading ? 'Application...' : `Confirmer (${importSelected.size})`}
                    </button>
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-100">
                  {importPreview.map((entry, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${importSelected.has(i) ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
                    >
                      <input
                        type="checkbox"
                        checked={importSelected.has(i)}
                        onChange={() => toggleImportEntry(i)}
                        className="w-4 h-4 accent-emerald-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">{entry.name}</span>
                        {entry.medication_id ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Existant</span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Nouveau</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-500 flex-shrink-0">{entry.price.toLocaleString()} F</span>
                      <span className="text-xs font-black text-emerald-600 flex-shrink-0 w-16 text-right">{entry.quantity} u.</span>
                    </label>
                  ))}
                </div>

                {importUnmatched.length > 0 && (
                  <details className="bg-slate-50 rounded-2xl p-4">
                    <summary className="text-xs font-black text-slate-500 uppercase cursor-pointer">
                      {importUnmatched.length} ligne(s) non reconnue(s) — à corriger et recoller si besoin
                    </summary>
                    <ul className="mt-3 space-y-1 text-xs text-slate-500 font-mono">
                      {importUnmatched.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((item) => (
            <div key={item.stock_id} className={`bg-white p-5 rounded-[28px] shadow-sm border ${item.quantity < 10 ? 'border-red-200 ring-2 ring-red-50' : 'border-slate-100'} flex flex-col justify-between group relative overflow-hidden`}>
              {item.quantity < 10 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-tighter animate-pulse">
                  Stock Faible
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${item.quantity < 10 ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <Package className={item.quantity < 10 ? 'text-red-500 w-6 h-6' : 'text-slate-400 w-6 h-6'} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base leading-tight">{item.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
                <button onClick={() => deleteStock(item.stock_id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                <p className="text-lg font-black text-slate-900">{parseFloat(item.price).toLocaleString()} F</p>

                {editingStockId === item.stock_id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmEditQuantity(item.stock_id); if (e.key === 'Escape') setEditingStockId(null); }}
                      onBlur={() => confirmEditQuantity(item.stock_id)}
                      className="w-16 text-center bg-slate-50 rounded-lg py-1 px-1 font-black text-sm outline-none ring-2 ring-emerald-500"
                    />
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => confirmEditQuantity(item.stock_id)} className="p-1.5 bg-emerald-600 text-white rounded-lg active:scale-90 transition-all">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => nudgeQuantity(item.stock_id, -1)}
                      disabled={item.quantity === 0 || pendingStockId === item.stock_id}
                      title="Retirer 1 unité"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg active:scale-90 transition-all disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startEditingQuantity(item)}
                      title="Cliquer pour saisir la quantité exacte"
                      className={`text-sm font-black px-2 py-1 rounded-lg min-w-[64px] transition-all ${item.quantity < 10 ? 'bg-red-100 text-red-700' : item.quantity < 20 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      {item.quantity} units
                    </button>
                    <button
                      onClick={() => nudgeQuantity(item.stock_id, 1)}
                      disabled={pendingStockId === item.stock_id}
                      title="Ajouter 1 unité"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg active:scale-90 transition-all disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
